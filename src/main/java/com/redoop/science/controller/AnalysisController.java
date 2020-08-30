
package com.redoop.science.controller;


import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.redoop.science.entity.*;
import com.redoop.science.service.IAnalysisService;
import com.redoop.science.service.ISysPermissionService;
import com.redoop.science.service.ISysRoleAnalysisService;
import com.redoop.science.service.ISysUserRoleService;
import com.redoop.science.utils.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

/**
 * <p>
 *  分析 前端控制器
 * </p>
 *
 * @author admin
 * @since 2018-09-26
 */
@Controller
@RequestMapping("/analysis")
public class AnalysisController {
    Logger logger = LoggerFactory.getLogger(getClass());
    @Autowired
    private IAnalysisService analysisService;
    @Autowired
    ISysPermissionService sysPermissionService;

    @Autowired
    private ISysUserRoleService userRoleService;

    @Autowired
    ISysRoleAnalysisService roleAnalysisService;
    /**
     * 分析列表List
     * @param model
     * @param num
     * @param request
     * @return
     */
    @GetMapping("/{num}")
    public ModelAndView index(Model model, @PathVariable Long num, HttpServletRequest request){
        Integer id = SessionUtils.getUserId(request);
        Page<Analysis> page = new Page<>();
        page.setSize(11L);
        page.setCurrent(num);
        page.setDesc("ID");

        Map<String,Object> params = new HashMap();
        params.put("id",id);

        IPage<Analysis> pages =null;
        //根据登录用户id 获取用户拥有角色ID
        List<Long> userRoleIdList = userRoleService.findByRoleIdList(Long.valueOf(id));
        for (Long r :userRoleIdList){
            //判断是否为系统管理员，是则获取所有的列表信息
            if (r.intValue()==1){
                pages =  analysisService.pageListAdmin(page);
            }else {
                //列表(根据角色信息获取)
                pages = analysisService.pageList(page, params);
            }
        }
        //IPage<Analysis> pages = analysisService.pageList(page,params);

        List<SysPermission> permissionList = sysPermissionService.findByPermission(id);

        model.addAttribute("permissionList",permissionList);
        model.addAttribute("nickName", SessionUtils.getUserNickName(request));
        model.addAttribute("list", pages.getRecords());
        //System.out.println("分析数据》》》》》》"+pages.getRecords());
        //model.addAttribute("activeType", 3);
        model.addAttribute("pageNum", num);
        model.addAttribute("analysis", new Analysis());
        model.addAttribute("pages", pages.getPages());
        model.addAttribute("total", pages.getTotal());
        return new ModelAndView("/analysis/index");
    }

    @RequestMapping("/lists")
    @ResponseBody
    public List<Map<String, Object>> list(){
        //函数树
        List<Map<String,Object>> analysisZList = new ArrayList<>();
        Map<String,Object> fMap = new HashMap<>();
        fMap.put("pId",0);
        fMap.put("name","分析");
        fMap.put("icon","/img/icon/db.png");
        fMap.put("id",1);
        analysisZList.add(fMap);
        List<Analysis> analysisList = analysisService.list(null);
        for (Analysis analysis:analysisList){
            Map<String,Object> fMap2 = new HashMap<>();
            fMap2.put("pId",1);
            fMap2.put("name",analysis.getName());
            fMap2.put("icon","/img/icon/table.png");
            fMap2.put("id",analysis.getId());
            analysisZList.add(fMap2);
        }
        return analysisZList;
    }

    @GetMapping("/add")
    public ModelAndView add(Model model,HttpServletRequest request){
        //getZtree(model);
        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
        model.addAttribute("permissionList",permissionList);
        model.addAttribute("nickName", SessionUtils.getUserNickName(request));
        return new ModelAndView("/analysis/update");
    }

    /**
     * 保存
     * @param request
     * @param id
     * @param sql
     * @param sqlName
     * @return
     */
    @PostMapping("/save")
    @ResponseBody
    public Result saveOrUpdate(HttpServletRequest request, @RequestParam(name = "id",required = false) Long id,
                       @RequestParam(name = "sql") String sql,
                       @RequestParam(value = "sqlName") String  sqlName) {
        Analysis analysis = null;
        SysUserDetails sysUser = SessionUtils.getUser(request);
        QueryWrapper queryWrapper = new QueryWrapper();
        queryWrapper.eq("NAME",sqlName);
        Analysis analy  = analysisService.getOne(queryWrapper);
        if(id!=null){
            analysis = analysisService.getById(id);
            if (sqlName.equals(analysis.getName()) ||analy==null){
                analysis.setCode(ParseSql.parse(sql));
                analysis.setName(sqlName);
                analysis.setFinallyCode(sql);
                analysis.setOperationTime(new Date());
                analysis.setOperationId(sysUser.getId());
            }else {
                return new Result(ResultEnum.REPEAT);
            }
        }else{
            if(analy!=null){
                return new Result(ResultEnum.REPEAT);
            }else{
                analysis = new Analysis();
                analysis.setCode(ParseSql.parse(sql));
                analysis.setFinallyCode(sql);
                analysis.setOperationId(sysUser.getId());
                analysis.setCreateDate(new Date());
                analysis.setCreatorId(sysUser.getId());
                analysis.setCreatorName(sysUser.getNickname());
                analysis.setName(sqlName);
            }
        }

        if (analysisService.saveOrUpdate(analysis)){

            //将本角色下用户创建的信息，保存至中间表中，方便本角色下所有的用户访问
            List<Long> roleIdList = userRoleService.findByRoleIdList(Long.valueOf(SessionUtils.getUserId(request)));
            List<SysRoleAnalysis> list = new ArrayList<>(SessionUtils.getUserId(request));
            for (Long roleId : roleIdList) {
                SysRoleAnalysis roleAnalysis = new SysRoleAnalysis();
                roleAnalysis.setAnalysisId(analysis.getId());
                roleAnalysis.setRoleId(roleId.intValue());
                list.add(roleAnalysis);
            }
            //System.out.println("list》》》》》》"+list);
            roleAnalysisService.saveBatch(list);

            return new Result<String>(ResultEnum.SECCUSS);
        }else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }

    /**
     * 修改
     * @param model
     * @param id
     * @param request
     * @return
     */
    @GetMapping("/edit/{id}")
    public ModelAndView edit(Model model,@PathVariable(value = "id") String id,HttpServletRequest request){
        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
        Analysis analysis = analysisService.getById(id);
        model.addAttribute("permissionList",permissionList);
        if(analysis!=null){
            model.addAttribute("analysis", analysis);
            //返回值
            //getZtree(model);
            model.addAttribute("nickName", SessionUtils.getUserNickName(request));
            return new ModelAndView("/analysis/update");
        }else{
            model.addAttribute("message","不存在查询信息");
            return new ModelAndView("/error/500");
        }

    }


    /**
     * 删除
     * @param id
     * @return
     */
    @RequestMapping("/delete/{id}")
    public String delete(@PathVariable(value = "id")  Integer id){
        if (id!=null){
            analysisService.removeById(id);
            roleAnalysisService.deleteAnalysis(id);
            return "redirect:/analysis/1";
        } else {
            return String.valueOf(new Result<String>(ResultEnum.FAIL));
        }
    }

}