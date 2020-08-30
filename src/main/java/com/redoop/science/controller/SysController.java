
package com.redoop.science.controller;


import com.redoop.science.entity.*;
import com.redoop.science.service.ISysDeptService;
import com.redoop.science.service.ISysPermissionService;
import com.redoop.science.service.ISysUserRoleService;
import com.redoop.science.service.ISysUserService;
import com.redoop.science.utils.Result;
import com.redoop.science.utils.ResultEnum;
import com.redoop.science.utils.SessionUtils;
import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * @author admin
 * @since 2018年11月12日09:05:21
 * <p>
 * sysController
 */
@Controller
@RequestMapping("/sys")
public class SysController {

    @Autowired
    ISysPermissionService sysPermissionService;

    @Autowired
    private ISysUserService sysUserService;

    @Autowired
    private ISysUserRoleService userRoleService;

    @Autowired
    ISysDeptService sysDeptServicel;


    @Autowired
    private PasswordEncoder passwordEncoder;


    @GetMapping("/manage")
    public ModelAndView index(Model model, HttpServletRequest request) {

        //根据用户SESSIONiD ，查询用户所拥有的权限(菜单栏)
        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));

        model.addAttribute("permissionList", permissionList);

        model.addAttribute("nickName", SessionUtils.getUserNickName(request));

        return new ModelAndView("common/header");
    }


    /**
     * 所有用户列表
     */
    @GetMapping("/user/list")
    public String index(Map map, HttpServletRequest request) {

        List<SysUser> list = sysUserService.list(null);
        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
        //List<SysPermission> permissionList = sysPermissionService.getTpyeList();
        map.put("page", list);
        map.put("permissionList", permissionList);
        map.put("nickName", SessionUtils.getUserNickName(request));

        return "/sys/user";
    }


    @RequestMapping("/user/lists")
    @ResponseBody
    public Map<String, Object> lists() {

        List<SysUser> pages = sysUserService.list(null);

        for (SysUser sysUser : pages) {
            SysDept sysDept = sysDeptServicel.getById(sysUser.getDeptId());
            if (sysDept != null) {
                sysUser.setDeptName(sysDept.getName());
            }
        }
        Map<String, Object> page = new HashMap<>();
        page.put("currPage", 1);
        page.put("totalPage", 100);
        page.put("pageSize", 100);
        page.put("totalCount", 100);
        page.put("list", pages);


        Map<String, Object> map = new HashMap<>();
        map.put("page", page);

        return map;
    }


    /**
     * 用户信息
     */
    @RequestMapping("/user/info/{id}")
    @ResponseBody
    public Map info(@PathVariable("id") Long id) {

        SysUser user = sysUserService.getById(id);

        //获取用户所属的角色列表
        List<Long> roleIdList = userRoleService.findByRoleIdList(id);
        user.setRoleIdList(roleIdList);
        Map map = new HashMap();
        map.put("user", user);

        return map;
    }

    /**
     * 保存用户
     */
    @RequestMapping("/user/save")
    @ResponseBody
    public Result save(@RequestBody SysUser user) {

        user.setNickName(user.getUsername());
        //LocalDateTime localDateTime = LocalDateTime.now();
        //localDateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        //user.setCreateDate(new  Date());
        user.setPassword(passwordEncoder.encode(user.getPassword().trim()));
        if (sysUserService.save(user)) {

            //保存用户与角色关系
            List<SysUserRole> list = new ArrayList<>(user.getRoleIdList().size());
            for (Long roleId : user.getRoleIdList()) {
                SysUserRole sysUserRoleEntity = new SysUserRole();
                sysUserRoleEntity.setUserId(user.getId());
                sysUserRoleEntity.setRoleId(roleId.intValue());
                list.add(sysUserRoleEntity);
            }
            userRoleService.saveBatch(list);

            return new Result<String>(ResultEnum.SECCUSS);
        } else {
            return new Result<String>(ResultEnum.FAIL);
        }

    }


    /**
     * 修改用户
     */
    @RequestMapping("/user/update")
    @ResponseBody
    public Result update(@RequestBody SysUser user) {
        //user.setNickName(user.getUsername());
       // user.setCreateDate(new  Date());
       /* LocalDateTime localDateTime = LocalDateTime.now();
        localDateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        user.setCreateDate(localDateTime);*/
        if (StringUtils.isBlank(user.getPassword())) {
            user.setPassword(null);
        } else {
            user.setPassword(passwordEncoder.encode(user.getPassword().trim()));
        }

        //根据用户ID删除 用户的角色
        Integer user_id = user.getId();
        userRoleService.delete(user_id);
        if (sysUserService.saveOrUpdate(user)) {
            //保存用户与角色关系
            List<SysUserRole> list = new ArrayList<>(user.getRoleIdList().size());
            for (Long roleId : user.getRoleIdList()) {
                SysUserRole sysUserRoleEntity = new SysUserRole();
                sysUserRoleEntity.setUserId(user.getId());
                sysUserRoleEntity.setRoleId(roleId.intValue());
                list.add(sysUserRoleEntity);
            }
            userRoleService.saveBatch(list);

            return new Result<String>(ResultEnum.SECCUSS);
        } else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }


    /**
     * 删除用户
     */
    @RequestMapping("/user/delete")
    @ResponseBody
    public Result delete(@RequestBody Long[] userIds, HttpServletRequest request) {

        if (ArrayUtils.contains(userIds, 1L)) {
            return new Result<String>(ResultEnum.ADMIN_USER);
        }
        String isId = sysUserService.findById(SessionUtils.getUserNickName(request));
        long l = Long.parseLong(isId);
        if (ArrayUtils.contains(userIds, l)) {
            return new Result<String>(ResultEnum.IS_USER);
        }
        if (userIds != null) {
            for (Long a : userIds) {
                userRoleService.delete(a.intValue());
            }
        }
        if (sysUserService.removeByIds(Arrays.asList(userIds))) {

            return new Result<String>(ResultEnum.SECCUSS);
        } else {
            return new Result<String>(ResultEnum.FAIL);
        }

    }


}