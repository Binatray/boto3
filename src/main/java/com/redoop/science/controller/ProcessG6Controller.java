package com.redoop.science.controller;


import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.redoop.science.entity.*;
import com.redoop.science.service.IProcessG6Service;
import com.redoop.science.service.ISysPermissionService;
import com.redoop.science.service.ISysUserRoleService;
import com.redoop.science.utils.SessionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.swing.plaf.synth.SynthOptionPaneUI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 工作流Editor控制器
 * 2019年3月8日16:39:03
 * admin
 */
@Controller
@RequestMapping("/process")
public class ProcessG6Controller {

    @Autowired
    ISysPermissionService sysPermissionService;

    @Autowired
    private ISysUserRoleService userRoleService;

    @Autowired
    private IProcessG6Service processG6Service;

    @ResponseBody
    @GetMapping("/{num}")
    public ModelAndView index(Model model, @PathVariable Long num, HttpServletRequest request) {

        Integer id = SessionUtils.getUserId(request);
        Page<ProcessG6> page = new Page<>();
        page.setSize(11L);
        page.setCurrent(num);
        page.setDesc("ID");

        Map<String,Object> params = new HashMap();
        params.put("id",id);

        IPage<ProcessG6> pages =null;
        //根据登录用户id 获取用户拥有角色ID
        List<Long> userRoleIdList = userRoleService.findByRoleIdList(Long.valueOf(id));
        for (Long r :userRoleIdList){
            //判断是否为系统管理员，是则获取所有的列表信息
            if (r.intValue()==1){
                pages =  processG6Service.pageListAdmin(page);
            }else {
                //列表(根据角色信息获取)
                pages = processG6Service.pageList(page, params);
            }
        }
        //IPage<Analysis> pages = analysisService.pageList(page,params);

        List<SysPermission> permissionList = sysPermissionService.findByPermission(id);

        model.addAttribute("permissionList",permissionList);
        model.addAttribute("nickName", SessionUtils.getUserNickName(request));
        model.addAttribute("list", pages.getRecords());
        System.out.println("数据》》》》》》"+pages.getRecords());
        //model.addAttribute("activeType", 6);
        model.addAttribute("pageNum", num);
        model.addAttribute("process", new ProcessG6());
        model.addAttribute("pages", pages.getPages());
        model.addAttribute("total", pages.getTotal());


        return new ModelAndView("/process/g6");
    }


    /**
     * 保存接口
     * @param processG6
     */
    @ResponseBody
    @RequestMapping("/save")
    public void add(@RequestBody ProcessG6 processG6){

        processG6Service.save(processG6);
    }

   /* @GetMapping("/{num}")
    public ModelAndView index(Model model, @PathVariable Long num, HttpServletRequest request) {

        model.addAttribute("activeType", 6);

        return new ModelAndView("/sys/g6");
    }*/



}
