
package com.redoop.science.controller;


import com.redoop.science.constant.DBEnum;
import com.redoop.science.entity.SysPermission;
import com.redoop.science.service.ISysPermissionService;
import com.redoop.science.utils.RRException;
import com.redoop.science.utils.ResultEnum;
import com.redoop.science.utils.SessionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Controller;
import com.redoop.science.utils.Result;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * <p>
 * 菜单  前端控制器
 * </p>
 *
 * @author Alan
 * @since 2018-10-29
 */
@Controller
@RequestMapping("/sys/permission")
public class SysPermissionController {

    @Autowired
    ISysPermissionService sysPermissionService;

    @GetMapping("/list")
    public String index(Map map, HttpServletRequest request) {
        //List<SysPermission> permissionList = sysPermissionService.list(null);
        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
        for (SysPermission permission : permissionList) {
            SysPermission parentDeptEntity = sysPermissionService.getById(permission.getParentId());
            if (parentDeptEntity != null) {
                permission.setParentName(parentDeptEntity.getName());
            }
        }
        map.put("permissionList", permissionList);
        map.put("nickName", SessionUtils.getUserNickName(request));
        return "/sys/permission";
    }


    @RequestMapping("/lists")
    @ResponseBody
    public List<SysPermission> list() {
        List<SysPermission> permissionList = sysPermissionService.list(null);
        for (SysPermission permission : permissionList) {
            SysPermission parentPermission = sysPermissionService.getById(permission.getParentId());
            if (parentPermission != null) {
                permission.setParentName(parentPermission.getName());
            }
        }
        //System.out.println("permissionList>>>>>>>>>"+permissionList);
        return permissionList;
    }


    /**
     * 选择菜单(添加、修改菜单)
     */
    @RequestMapping("/select")
    @ResponseBody
    public Map select() {
        //查询列表数据
        List<SysPermission> permissionList = sysPermissionService.getNotButtonList();

        //添加顶级菜单
        SysPermission root = new SysPermission();
        root.setId(0);
        root.setName("一级菜单");
        root.setParentId(-1L);
        root.setOpen(true);
        permissionList.add(root);
        Map map = new HashMap();
        map.put("permissionList", permissionList);
        return map;
    }


    /**
     * 菜单信息
     */
    @RequestMapping("/info/{id}")
    @ResponseBody
    public Map info(@PathVariable("id") Integer id) {
        SysPermission menu = sysPermissionService.getById(id);
        Map map = new HashMap();
        map.put("menu", menu);
        return map;
    }

    /**
     * 保存
     */
    @RequestMapping("/save")
    @ResponseBody
    public Result save(@RequestBody SysPermission sysPermission) {
        //数据校验
        verifyForm(sysPermission);

        if (sysPermissionService.save(sysPermission)) {
            return new Result<String>(ResultEnum.SECCUSS);
        } else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }

    /**
     * 修改
     */
    @RequestMapping("/update")
    @ResponseBody
    public Result update(@RequestBody SysPermission sysPermission) {
        //数据校验
        verifyForm(sysPermission);

        if (sysPermissionService.updateById(sysPermission)) {
            return new Result<String>(ResultEnum.SECCUSS);
        } else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }

    /**
     * 删除
     */
    @RequestMapping("/delete")
    @ResponseBody
    public Result delete(Integer id) {

        /*if(id <= 31){
            return new Result<String>(ResultEnum.SYS_MENU);
        }*/
        //判断是否有子菜单或按钮
        List<SysPermission> menuList = sysPermissionService.getListParentId(id);
        if (menuList.size() > 0) {
            return new Result<String>(ResultEnum.DELETE_CHILD_MENU_BTN);
        }
        if (sysPermissionService.removeById(id)) {
            return new Result<String>(ResultEnum.SECCUSS);
        } else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }


    /**
     * 验证参数是否正确
     */
    private void verifyForm(SysPermission permission) {
        if (StringUtils.isBlank(permission.getName())) {
            throw new RRException("菜单名称不能为空");
        }

        if (permission.getParentId() == null) {
            throw new RRException("上级菜单不能为空");
        }

        //菜单
        if (permission.getType() == DBEnum.MenuType.MENU.getValue()) {
            if (StringUtils.isBlank(permission.getUrl())) {
                throw new RRException("菜单URL不能为空");
            }
        }

        //上级菜单类型
        int parentType = DBEnum.MenuType.CATALOG.getValue();
        if (permission.getParentId() != 0) {
            SysPermission parentMenu = sysPermissionService.getById(permission.getParentId());
            parentType = parentMenu.getType();
        }

        //目录、菜单
        if (permission.getType() == DBEnum.MenuType.CATALOG.getValue() ||
                permission.getType() == DBEnum.MenuType.MENU.getValue()) {
            if (parentType != DBEnum.MenuType.CATALOG.getValue()) {
                throw new RRException("上级菜单只能为目录类型");
            }
            return;
        }

        //按钮
        if (permission.getType() == DBEnum.MenuType.BUTTON.getValue()) {
            if (parentType != DBEnum.MenuType.MENU.getValue()) {
                throw new RRException("上级菜单只能为菜单类型");
            }
            return;
        }
    }


}