
package com.redoop.science.controller;


import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.redoop.science.entity.*;
import com.redoop.science.service.IRegFunctionService;
import com.redoop.science.service.ISysPermissionService;
import com.redoop.science.service.ISysRoleFunService;
import com.redoop.science.service.ISysUserRoleService;
import com.redoop.science.utils.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import org.springframework.stereotype.Controller;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;

import java.util.*;

/**
 * <p>
 * 注册函数 前端控制器
 * </p>
 *
 * @author Alan
 * @since 2018-10-16
 */
@Controller
@RequestMapping("/function")
public class RegFunctionController {
    Logger logger = LoggerFactory.getLogger(getClass());

    @Autowired
    private IRegFunctionService regFunctionService;
    @Autowired
    ISysPermissionService sysPermissionService;
    @Autowired
    ISysRoleFunService roleFunService;
    @Autowired
    private ISysUserRoleService userRoleService;

    @GetMapping("/{num}")
    public ModelAndView index(Model model, @PathVariable Long num, HttpServletRequest request) {

        Integer id = SessionUtils.getUserId(request);

        Page<RegFunction> page = new Page<>();
        page.setSize(11L);
        page.setCurrent(num);
        page.setDesc("ID");

        Map<String, Object> params = new HashMap();
        params.put("id", id);

        IPage<RegFunction> pages = null;
        //根据登录用户id 获取用户拥有角色ID
        List<Long> userRoleIdList = userRoleService.findByRoleIdList(Long.valueOf(id));
        for (Long r :userRoleIdList){
            //判断是否为系统管理员，是则获取所有的列表信息
            if (r.intValue()==1){
                pages =  regFunctionService.pageListAdmin(page);
            }else {
                //列表(根据角色信息获取)
                pages = regFunctionService.pageList(page, params);
            }
        }
       // IPage<RegFunction> pages = regFunctionService.pageList(page, params);


        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
        model.addAttribute("permissionList", permissionList);
        model.addAttribute("nickName", SessionUtils.getUserNickName(request));
        model.addAttribute("items", pages.getRecords());
        // model.addAttribute("activeType", 6);
        model.addAttribute("pageNum", num);
        model.addAttribute("pages", pages.getPages());
        model.addAttribute("total", pages.getTotal());
        return new ModelAndView("/function/index");
    }


    @RequestMapping("/lists")
    @ResponseBody
    public List<Map<String, Object>> list() {
        //函数树
        List<Map<String, Object>> funZList = new ArrayList<>();
        Map<String, Object> fMap = new HashMap<>();
        fMap.put("pId", 0);
        fMap.put("name", "函数库");
        fMap.put("icon", "/img/icon/db.png");
        fMap.put("id", 1);
        funZList.add(fMap);
        List<RegFunction> regFunctionList = regFunctionService.list(null);
        for (RegFunction regFunction : regFunctionList) {
            Map<String, Object> fMap2 = new HashMap<>();
            fMap2.put("pId", 1);
            fMap2.put("name", regFunction.getName());
            fMap2.put("icon", "/img/icon/table.png");
            fMap2.put("id", regFunction.getId());
            funZList.add(fMap2);
        }
        return funZList;
    }

    @GetMapping("/edit/{id}")
    public ModelAndView edit(Model model, @PathVariable(value = "id") String id, HttpServletRequest request) {
        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
        model.addAttribute("permissionList", permissionList);
        RegFunction regFunction = regFunctionService.getById(id);
        if (regFunction != null) {
            model.addAttribute("virtual", regFunction);
            //返回值
            model.addAttribute("nickName", SessionUtils.getUserNickName(request));
            return new ModelAndView("/function/edit");
        } else {
            model.addAttribute("message", "不存在查询信息");
            return new ModelAndView("/error/404");
        }

    }

    @GetMapping("/add")
    public ModelAndView add(Model model, HttpServletRequest request) {
        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
        model.addAttribute("permissionList", permissionList);
        model.addAttribute("nickName", SessionUtils.getUserNickName(request));
        return new ModelAndView("/function/edit");
    }

    @RequestMapping("/delete/{id}")
    @ResponseBody
    public Result<String> delete(@PathVariable Integer id) {
        if (regFunctionService.removeById(id)) {
            roleFunService.deleteFunId(id);
            return new Result<String>(ResultEnum.SECCUSS);
        } else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }

    @PostMapping("/save")
    @ResponseBody
    public Result<String> save(@RequestParam(name = "id", required = false) Long id,
                               @RequestParam(name = "code") String code,
                               @RequestParam(value = "name") String name,
                               HttpServletRequest request) {
        RegFunction regFunction = null;
        SysUserDetails sysUser = SessionUtils.getUser(request);

        QueryWrapper<RegFunction> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("NAME", name);
        RegFunction fun  = regFunctionService.getOne(queryWrapper);

        if(id!=null){
            regFunction = regFunctionService.getById(id);
            if (name.equals(regFunction.getName()) ||fun==null){
                regFunction.setCode(code);
                regFunction.setName(name);
                regFunction.setCreateDate(new Date());
                regFunction.setCreatorId(sysUser.getId());
                regFunction.setCreatorName(sysUser.getNickname());
            }else {
                return new Result(ResultEnum.REPEAT);
            }
        }else{
            if(fun!=null){
                return new Result(ResultEnum.REPEAT);
            }else{
                regFunction = new RegFunction();
                regFunction.setCreateDate(new Date());
                regFunction.setCode(code);
                regFunction.setName(name);
                regFunction.setCreatorId(sysUser.getId());
                regFunction.setCreatorName(sysUser.getNickname());
            }
        }
        //注册函数
        if (regFunctionService.saveOrUpdate(regFunction)) {
            //将本角色下用户创建的信息，保存至中间表中，方便本角色下所有的用户访问
            List<Long> roleIdList = userRoleService.findByRoleIdList(Long.valueOf(SessionUtils.getUserId(request)));
            List<SysRoleFunction> list = new ArrayList<>(SessionUtils.getUserId(request));
            for (Long roleId : roleIdList) {
                SysRoleFunction sysRoleFunction = new SysRoleFunction();
                sysRoleFunction.setFunctionId(regFunction.getId());
                sysRoleFunction.setRoleId(roleId.intValue());
                list.add(sysRoleFunction);
            }
            //System.out.println("list》》》》》》"+list);
            roleFunService.saveBatch(list);
            return new Result<String>(ResultEnum.SECCUSS);
        } else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }
}