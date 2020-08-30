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
        page.se