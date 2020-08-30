
package com.redoop.science.controller;

import com.redoop.science.entity.SysDept;
import com.redoop.science.entity.SysPermission;
import com.redoop.science.service.ISysDeptService;
import com.redoop.science.service.ISysPermissionService;
import com.redoop.science.utils.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author admin
 * @since 2018年11月6日15:27:30
 * <p>
 * 部门Controller
 */
@Controller
@RequestMapping("/sys/dept")
public class SysDeptController {

    @Autowired
    ISysDeptService deptService;

    @Autowired
    ISysPermissionService sysPermissionService;

    @RequestMapping("/list")
    public String index(Map map, HttpServletRequest request) throws CustomException {
        List<SysDept> deptList = deptService.list(null);
        for (SysDept sysDept : deptList) {
            SysDept parentDeptEntity = deptService.getById(sysDept.getParentId());
            if (parentDeptEntity != null) {
                sysDept.setParentName(parentDeptEntity.getName());
            }
        }

        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
        map.put("deptList", deptList);
        map.put("permissionList", permissionList);
        map.put("nickName", SessionUtils.getUserNickName(request));
        //return "/sys/g6";
        return "/sys/dept";
    }


    @RequestMapping("/lists")
    @ResponseBody
    public List<SysDept> list() {

        List<SysDept> deptList = deptService.list(null);

        for (SysDept sysDept : deptList) {
            SysDept parentDeptEntity = deptService.getById(sysDept.getParentId());
            if (parentDeptEntity != null) {
                sysDept.setParentName(parentDeptEntity.getName());
            }
        }

        return deptList;
    }

    /**
     * 选择部门(添加、修改菜单)
     */
    @RequestMapping("/select")
    @ResponseBody
    public Map select(Model model) {
        List<SysDept> deptList = deptService.list(null);
        for (SysDept sysDept : deptList) {
            SysDept parentDeptEntity = deptService.getById(sysDept.getParentId());
            if (parentDeptEntity != null) {
                sysDept.setParentName(parentDeptEntity.getName());
            }
        }

        System.out.println("选择部门(添加、修改菜单)deptList>>>>>>>>>>>>>>>>>>>>" + deptList);
        //添加一级部门
        SysDept root = new SysDept();
        root.setId(0);
        root.setName("一级部门");
        root.setParentId(-1L);
        root.setOpen(true);
        deptList.add(root);
        Map map = new HashMap();
        map.put("deptList", deptList);
        return map;
    }


    /**
     * 上级部门Id(管理员则为0)
     */
    @GetMapping("/info")
    @ResponseBody
    public Map info() {
        long id = 0;
        List<SysDept> deptList = deptService.list(null);
        for (SysDept sysDept : deptList) {
            SysDept parentDeptEntity = deptService.getById(sysDept.getParentId());
            if (parentDeptEntity != null) {
                sysDept.setParentName(parentDeptEntity.getName());
            }
        }

        System.out.println("上级部门>>>>>>>>>>>>>>>>" + deptList);
        Long parentId = null;
        for (SysDept sysDeptEntity : deptList) {
            if (parentId == null) {
                parentId = sysDeptEntity.getParentId();
                continue;
            }
            if (parentId > sysDeptEntity.getParentId().longValue()) {
                parentId = sysDeptEntity.getParentId();
            }
        }
        id = parentId;
        Map map = new HashMap();
        map.put("id", id);
        return map;
    }

    /**
     * 信息
     */
    @RequestMapping("/info/{id}")
    @ResponseBody
    public Map info(@PathVariable("id") Integer id) {
        SysDept dept = deptService.getById(id);
        Map map = new HashMap();
        map.put("dept", dept);
        return map;
    }

    //保存

    @PostMapping("/save")
    @ResponseBody
    public Result save(@RequestBody SysDept dept) {

        if (deptService.save(dept)) {
            return new Result<String>(ResultEnum.SECCUSS);
        } else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }

    //修改

    @RequestMapping("/update")
    @ResponseBody
    public Result update(@RequestBody SysDept dept) {

        if (deptService.updateById(dept)) {
            return new Result<String>(ResultEnum.SECCUSS);
        } else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }

    //删除

    @RequestMapping("/delete")
    @ResponseBody
    public Result delete(Integer id) {
        //判断是否有子部门
        List<Integer> deptList = deptService.queryDetpIdList(id);
        if (deptList.size() > 0) {
            return new Result<String>(ResultEnum.DELETE_CHILD);
        }

        if (deptService.removeById(id)) {
            return new Result<String>(ResultEnum.SECCUSS);
        } else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }


}