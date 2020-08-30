
package com.redoop.science.controller;


import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.redoop.science.constant.DBEnum;
import com.redoop.science.entity.*;
import com.redoop.science.service.*;
import com.redoop.science.utils.Result;
import com.redoop.science.utils.ResultEnum;
import com.redoop.science.utils.SessionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import org.springframework.stereotype.Controller;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * <p>
 * 实体数据源库 前端控制器
 * </p>
 *
 * @author Alan
 * @since 2018-09-13
 */
@Controller
@RequestMapping("/real")
public class RealDbController {
    @Autowired
    private IRealDbService realDbService;
    @Autowired
    ISysPermissionService sysPermissionService;
    @Autowired
    ISysRoleRealDbService roleRealDbService;
    @Autowired
    private ISysUserRoleService userRoleService;

    /**
     * 数据源列表分类
     *
     * @param model
     * @return
     */
    @GetMapping("/{num}")
    public ModelAndView index(Model model, @PathVariable Long num, HttpServletRequest request) {

        String nickName = SessionUtils.getUserNickName(request);
        Integer id = SessionUtils.getUserId(request);

        Page<RealDb> page = new Page<>();
        page.setSize(11L);
        page.setCurrent(num);
        page.setDesc("ID");

        Map<String, Object> params = new HashMap();
        params.put("id", id);

        IPage<RealDb> pages = null;

        //根据登录用户id 获取用户拥有角色ID
        List<Long> userRoleIdList = userRoleService.findByRoleIdList(Long.valueOf(id));
        for (Long r :userRoleIdList){
            //判断是否为系统管理员，是则获取所有的列表信息
            if (r.intValue()==1){
                pages =  realDbService.pageListAdmin(page);
            }else {
                //列表(根据角色信息获取)
                pages = realDbService.pageList(page, params);
            }
        }
        //列表(根据角色信息获取)
        //IPage<RealDb> pages = realDbService.pageList(page, params);

        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));

        model.addAttribute("permissionList", permissionList);
        model.addAttribute("nickName", nickName);
        model.addAttribute("list", pages.getRecords());
        // model.addAttribute("activeType", 2);
        model.addAttribute("pageNum", num);
        model.addAttribute("real", new RealDb());
        model.addAttribute("pages", pages.getPages());
        model.addAttribute("total", pages.getTotal());
        return new ModelAndView("/realDb/index");
    }

    @RequestMapping("/lists")
    @ResponseBody
    public List<Map<String, Object>> list() {

        //  获取ztree json
        // 获取真实库ztreejson
        List<RealDb> realDbs = realDbService.list(null);


        List<Map<String, Object>> realZList = new ArrayList<>();
        for (DBEnum dbEnum : DBEnum.values()) {
            Map<String, Object> zMap = new HashMap<>();
            zMap.put("pId", 0);
            zMap.put("name", dbEnum.getName());
            zMap.put("icon", "/img/icon/" + dbEnum.getName() + ".png");
            zMap.put("id", dbEnum.getDbType());
            realZList.add(zMap);
        }
        for (RealDb realDb : realDbs) {
            Map<String, Object> zMap = new HashMap<>();
            zMap.put("pId", realDb.getDbType());
            zMap.put("name", realDb.getNikeName());
            zMap.put("icon", "/img/icon/db.png");
            zMap.put("id", realDb.getId());
            realZList.add(zMap);
        }
        return realZList;
    }


    /**
     * 去添加数据源
     *
     * @param model
     * @return
     */
    @RequestMapping(value = "/toAdd", method = RequestMethod.GET)
    public ModelAndView form(Model model, HttpServletRequest request) {
        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
        model.addAttribute("permissionList", permissionList);
        model.addAttribute("realDb", new RealDb());
        model.addAttribute("nickName", SessionUtils.getUserNickName(request));
        return new ModelAndView("/realDb/add");

    }

    /**
     * 保存
     *
     * @param realDb
     * @return
     */
    @PostMapping("/save")
    public ModelAndView save(@Validated RealDb realDb, BindingResult rs, Model model, HttpServletRequest request) {

        if (rs.hasErrors()) {
            for (ObjectError error : rs.getAllErrors()) {
                System.out.println(">>>>>>>>新增Real-db信息时-验证表单错误提示>>>>>>>" + error.getDefaultMessage());
            }
            return new ModelAndView("/realDb/add");
        }
        RealDb dataReal = realDbService.findByNikeName(realDb.getNikeName());
        if (dataReal != null) {
            model.addAttribute("hintMessage", "数据源名已经存在");
            List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
            model.addAttribute("permissionList", permissionList);
            model.addAttribute("nickName", SessionUtils.getUserNickName(request));
            return new ModelAndView("/realDb/add");
        } else {
            //保存数据源
            realDbService.saveForm(realDb);

            //将本角色下用户创建的信息，保存至中间表中，方便本角色下所有的用户访问
            List<Long> roleIdList = userRoleService.findByRoleIdList(Long.valueOf(SessionUtils.getUserId(request)));
            List<SysRoleRealDb> list = new ArrayList<>(SessionUtils.getUserId(request));
            for (Long roleId : roleIdList) {
                SysRoleRealDb sysRoleRealDb = new SysRoleRealDb();
                sysRoleRealDb.setRealDbId(realDb.getId());
                sysRoleRealDb.setRoleId(roleId.intValue());
                list.add(sysRoleRealDb);
            }
            //System.out.println("list》》》》》》"+list);
            roleRealDbService.saveBatch(list);
        }
        return new ModelAndView("redirect:/real/1");
    }

    /**
     * 去修改
     *
     * @param model
     * @param id
     * @return
     */
    @RequestMapping(value = "/toEdit/{id}", method = RequestMethod.GET)
    public ModelAndView toEdit(Model model, @PathVariable(value = "id") String id, HttpServletRequest request) {
        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
        model.addAttribute("permissionList", permissionList);
        RealDb realDb = realDbService.getById(id);
        if (realDb != null) {
            model.addAttribute("realDb", realDb);
            model.addAttribute("nickName", SessionUtils.getUserNickName(request));
            return new ModelAndView("/realDb/update");
        } else {
            return new ModelAndView("/error/500");
        }
    }

    /**
     * 查看单个数据源信息-不能修改
     *
     * @param model
     * @param id
     * @return
     */
    @RequestMapping(value = "/toList/{id}", method = RequestMethod.GET)
    public ModelAndView toList(Model model, @PathVariable(value = "id") String id, HttpServletRequest request) {

        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
        model.addAttribute("permissionList", permissionList);

        RealDb realDb = realDbService.getById(id);
        if (realDb != null) {
            model.addAttribute("realDb", realDb);
            model.addAttribute("nickName", SessionUtils.getUserNickName(request));
            return new ModelAndView("/realDb/update");
        } else {
            return new ModelAndView("/error/500");
        }
    }

    /**
     * 修改提交
     *
     * @param realDb
     * @return
     */
    @PostMapping("/update")
    public ModelAndView update(@Validated RealDb realDb, BindingResult rs, Model model, HttpServletRequest request) {

        if (rs.hasErrors()) {
            for (ObjectError error : rs.getAllErrors()) {
                System.out.println(">>>>>>>>修改Real-db信息提交时-验证表单错误提示>>>>>>>" + error.getDefaultMessage());
            }
            return new ModelAndView("/realDb/update");
        }
        //根据id查询
        RealDb realDb1 = realDbService.getById(realDb.getId());

        //System.out.println("根据id查询>>>>>>>>>"+realDb1);

        //System.out.println("realDb.getId()>>>>>>>>>"+realDb.getId());
        //System.out.println("realDb.getNikeName()>>>>>>>>>"+realDb.getNikeName());

        //根据数据源名查询
        RealDb dataReal = realDbService.findByNikeName(realDb.getNikeName());

       // System.out.println("根据数据源名查询>>>>>>>>>"+dataReal);

        realDb.setLogo(" /img/realDb/" + realDb.getDbType() + ".jpg");

        if (realDb.getNikeName().equals(realDb1.getNikeName()) || dataReal == null) {
            realDbService.updateById(realDb);
        } else {
            model.addAttribute("hintMessage", "数据源名已经存在");
            List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
            model.addAttribute("permissionList", permissionList);
            model.addAttribute("nickName", SessionUtils.getUserNickName(request));
            return new ModelAndView("/realDb/update");
        }

        return new ModelAndView("redirect:/real/1");
    }

    /**
     * 删除
     *
     * @param id
     * @return
     */
    @RequestMapping("/delete/{id}")
    public String delete(@PathVariable(value = "id") Integer id) {
        if (id != null) {
            realDbService.removeById(id);
            roleRealDbService.deleteDb(id);
            return "redirect:/real/1";
        } else {
            return String.valueOf(new Result<String>(ResultEnum.FAIL));
        }
    }

    /**
     * 查看库中的表信息
     *
     * @param model
     * @return
     */
    /*@RequestMapping("/selectDatabase")
    @ResponseBody
    public List<RealDb> selectDatabase(Model model, HttpServletRequest request) {

        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
        List<RealDb> list = realDbService.selectDatabase();
        model.addAttribute("permissionList", permissionList);
        model.addAttribute("list", list);
        return list;
    }*/

}