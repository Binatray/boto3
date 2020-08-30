package com.redoop.science.controller;

import com.redoop.science.entity.*;
import com.redoop.science.service.*;
import com.redoop.science.utils.Result;
import com.redoop.science.utils.ResultEnum;
import com.redoop.science.utils.SessionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import org.springframework.stereotype.Controller;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

/**
 * <p>
 * 系统权限 前端控制器
 * </p>
 *
 * @author Alan
 * @since 2018-10-29
 */
@Controller
@RequestMapping("/sys/role")
public class SysRoleController {

    Logger logger = LoggerFactory.getLogger(getClass());

    @Autowired
    ISysRoleService roleService;

    @Autowired
    ISysRolePermissionService rolePermissionService;

    @Autowired
    ISysRoleDeptService roleDeptService;

    @Autowired
    ISysDeptService sysDeptServicel;

    @Autowired
    ISysPermissionService sysPermissionService;

    @Autowired
    ISysRoleRealDbService roleRealDbService;

    @Autowired
    ISysRoleViewService roleViewService;

    @Autowired
    ISysRoleFunService roleFunService;

    @Autowired
    ISysRoleVirtualService roleVirtualService;

    @Autowired
    ISysRoleAnalysisService roleAnalysisService;


    /**
     * 角色列表
     */
    @GetMapping("/list")
    public String index(Map map, HttpServletRequest request) {

        List<SysRole> list = roleService.list(null);
        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
        map.put("page", list);
        map.put("permissionList", permissionList);
        map.put("nickName", SessionUtils.getUserNickName(request));

        return "/sys/role";
    }

    /**
     * 角色列表
     */
    @RequestMapping("/select")
    @ResponseBody
    public Map select() {
        List<SysRole> list = roleService.list(null);
        Map<String, Object> map = new HashMap<>();
        map.put("list", list);
        return map;
    }

    @RequestMapping("/lists")
    @ResponseBody
    public Map<String, Object> lists() {

        List<SysRole> pages = roleService.list(null);

        for (SysRole sysRole : pages) {
            SysDept sysDept = sysDeptServicel.getById(sysRole.getDeptId());
            if (sysDept != null) {
                sysRole.setDeptName(sysDept.getName());
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
     * 角色信息
     */
    @RequestMapping("/info/{id}")
    @ResponseBody
    public Map info(@PathVariable("id") Long id) {
        logger.info("/info/{id} 进入");
        SysRole role = roleService.getById(id);

        //查询角色对应的菜单
        List<Long> permissionIdList = rolePermissionService.queryMenuIdList(id);
        role.setPermissionIdList(permissionIdList);
        //System.out.println("查询角色对应的菜单>>>>>>" + permissionIdList);

        //查询角色对应的部门
        List<Long> deptIdList = roleDeptService.queryDeptIdList(new Long[]{id});
        role.setDeptIdList(deptIdList);
        // System.out.println("查询角色对应的部门>>>>>>>" + deptIdList);

        //查询角色对应的真实库
        List<Long> readDbIdList = roleRealDbService.queryReadDbIdList(id);
        role.setReadDbIdList(readDbIdList);
        //  System.out.println("查询角色对应的真实库>>>>>>" + readDbIdList);

        //查询角色对应的视图库
        List<Long> viewIdList = roleViewService.queryViewIdList(id);
        role.setViewIdList(viewIdList);
        //   System.out.println("查询角色对应的视图表>>>>>>" + viewIdList);


        //查询角色对应的函数库
        List<Long> funIdList = roleFunService.queryFunIdList(id);
        role.setFunIdList(funIdList);
        //  System.out.println("查询角色对应的函数库>>>>>>" + funIdList);

        //查询角色对应的虚拟库
        List<Long> virtualIdList = roleVirtualService.queryVirtualIdList(id);
        role.setVirtualIdList(virtualIdList);
        //  System.out.println("查询角色对应的虚拟>>>>>>" + virtualIdList);

        //查询角色对应的分析
        List<Long> analysisIdList = roleAnalysisService.queryAnalysisIdList(id);
        role.setAnalysisIdList(analysisIdList);
        //  System.out.println("查询角色对应的分析>>>>>>" + analysisIdList);


        Map map = new HashMap();
        map.put("role", role);

        return map;
    }


    /**
     * 保存角色
     */
    @RequestMapping("/save")
    @ResponseBody
    public Result save(@RequestBody SysRole role) {

        role.setCreateTime(new Date());
        // System.out.println("保存时:前端传回的role》》》》》》》" + role);
        if (roleService.save(role)) {

            //保存角色与部门关系
            List<SysRoleDept> list = new ArrayList<>(role.getDeptIdList().size());
            for (Long deptId : role.getDeptIdList()) {
                SysRoleDept sysRoleDeptEntity = new SysRoleDept();
                sysRoleDeptEntity.setDeptId(deptId.intValue());
                sysRoleDeptEntity.setRoleId(role.getId());
                list.add(sysRoleDeptEntity);
            }
            //   System.out.println("保存角色与部门关系>>>>"+list);
            roleDeptService.saveBatch(list);

            // 保存角色与菜单关系
            List<SysRolePermission> permissionList = new ArrayList<>(role.getPermissionIdList().size());
            for (Long permissionId : role.getPermissionIdList()) {
                SysRolePermission sysRolePermission = new SysRolePermission();
                sysRolePermission.setPermissionId(permissionId.intValue());
                sysRolePermission.setRoleId(role.getId());
                permissionList.add(sysRolePermission);
            }
            //  System.out.println("保存角色与菜单关系>>>>"+permissionList);
            rolePermissionService.saveBatch(permissionList);

            //保存角色与真实库关系
            List<SysRoleRealDb> realDbList = new ArrayList<>(role.getReadDbIdList().size());
            for (Long readDbId : role.getReadDbIdList()) {
                SysRoleRealDb realDb = new SysRoleRealDb();
                realDb.setRealDbId(readDbId.intValue());
                realDb.setRoleId(role.getId());
                realDbList.add(realDb);
            }
            // System.out.println("保存角色与真实库关系系>>>>"+realDbList);
            roleRealDbService.saveBatch(realDbList);


            //保存角色与视图库关系
            List<SysRoleViewsTables> viewIdList = new ArrayList<>(role.getViewIdList().size());
            for (Long viewsTablesId : role.getViewIdList()) {
                SysRoleViewsTables realDb = new SysRoleViewsTables();
                realDb.setViewTablesId(viewsTablesId.intValue());
                realDb.setRoleId(role.getId());
                viewIdList.add(realDb);
            }
            //  System.out.println("保存角色与视图库关系>>>>"+viewIdList);
            roleViewService.saveBatch(viewIdList);


            //保存角色与函数关系
            List<SysRoleFunction> funIdList = new ArrayList<>(role.getFunIdList().size());
            for (Long viewId : role.getFunIdList()) {
                SysRoleFunction fun = new SysRoleFunction();
                fun.setFunctionId(viewId.intValue());
                fun.setRoleId(role.getId());
                funIdList.add(fun);
            }
            // System.out.println("保存角色与函数关系>>>>"+funIdList);
            roleFunService.saveBatch(funIdList);


            //保存角色与虚拟关系
            List<SysRoleVirtualTables> virtualIdList = new ArrayList<>(role.getVirtualIdList().size());
            for (Long virtualId : role.getVirtualIdList()) {
                SysRoleVirtualTables fun = new SysRoleVirtualTables();
                fun.setVirtualId(virtualId.intValue());
                fun.setRoleId(role.getId());
                virtualIdList.add(fun);
            }
            //  System.out.println("保存角色与虚拟关系>>>>"+virtualIdList);
            roleVirtualService.saveBatch(virtualIdList);


            //保存角色与分析关系
            List<SysRoleAnalysis> analysisIdList = new ArrayList<>(role.getAnalysisIdList().size());
            for (Long viewId : role.getAnalysisIdList()) {
                SysRoleAnalysis fun = new SysRoleAnalysis();
                fun.setAnalysisId(viewId.intValue());
                fun.setRoleId(role.getId());
                analysisIdList.add(fun);
            }
            // System.out.println("保存角色与分析关系>>>>"+funIdList);
            roleAnalysisService.saveBatch(analysisIdList);


            return new Result<String>(ResultEnum.SECCUSS);
        } else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }

    /**
     * 修改角色
     */
    @RequestMapping("/update")
    @ResponseBody
    public Result update(@RequestBody SysRole role) {
        role.setCreateTime(new Date());
        if (roleService.saveOrUpdate(role)) {

            Long a = role.getId().longValue();

            //删除角色与部门关系
            roleDeptService.deleteBatch(new Long[]{a});
            //保存角色与部门关系
            List<SysRoleDept> list = new ArrayList<>(role.getDeptIdList().size());
            for (Long deptId : role.getDeptIdList()) {
                SysRoleDept sysRoleDeptEntity = new SysRoleDept();
                sysRoleDeptEntity.setDeptId(deptId.intValue());
                sysRoleDeptEntity.setRoleId(role.getId());

                list.add(sysRoleDeptEntity);
            }
            roleDeptService.saveBatch(list);

            //删除角色与菜单关系
            rolePermissionService.deleteBatch(new Long[]{a});
            // 保存角色与菜单关系
            List<SysRolePermission> permissionList = new ArrayList<>(role.getPermissionIdList().size());
            for (Long permissionId : role.getPermissionIdList()) {
                SysRolePermission sysRolePermission = new SysRolePermission();
                sysRolePermission.setPermissionId(permissionId.intValue());
                sysRolePermission.setRoleId(role.getId());
                permissionList.add(sysRolePermission);
            }
            rolePermissionService.saveBatch(permissionList);

            //删除角色与真实库关系
            roleRealDbService.deleteBatch(new Long[]{a});
            //保存角色与真实库关系
            List<SysRoleRealDb> realDbList = new ArrayList<>(role.getReadDbIdList().size());
            for (Long readDbId : role.getReadDbIdList()) {
                SysRoleRealDb realDb = new SysRoleRealDb();
                realDb.setRealDbId(readDbId.intValue());
                realDb.setRoleId(role.getId());
                realDbList.add(realDb);
            }
            roleRealDbService.saveBatch(realDbList);


            //删除角色与视图库关系
            roleViewService.deleteBatch(new Long[]{a});
            //保存角色与视图库关系
            List<SysRoleViewsTables> viewIdList = new ArrayList<>(role.getViewIdList().size());
            for (Long viewsTablesId : role.getViewIdList()) {
                SysRoleViewsTables roleView = new SysRoleViewsTables();
                roleView.setViewTablesId(viewsTablesId.intValue());
                roleView.setRoleId(role.getId());
                viewIdList.add(roleView);
            }
            roleViewService.saveBatch(viewIdList);


            //删除角色与函数关系
            roleFunService.deleteBatch(new Long[]{a});
            //保存角色与函数关系
            List<SysRoleFunction> funIdList = new ArrayList<>(role.getFunIdList().size());
            for (Long funId : role.getFunIdList()) {
                SysRoleFunction fun = new SysRoleFunction();
                fun.setFunctionId(funId.intValue());
                fun.setRoleId(role.getId());
                funIdList.add(fun);
            }
            roleFunService.saveBatch(funIdList);


            //删除角色与虚拟关系
            roleVirtualService.deleteBatch(new Long[]{a});
            //保存角色与虚拟关系
            List<SysRoleVirtualTables> virtualIdList = new ArrayList<>(role.getVirtualIdList().size());
            for (Long virtualId : role.getVirtualIdList()) {
                SysRoleVirtualTables fun = new SysRoleVirtualTables();
                fun.setVirtualId(virtualId.intValue());
                fun.setRoleId(role.getId());
                virtualIdList.add(fun);
            }
            roleVirtualService.saveBatch(virtualIdList);

            //删除角色与分析关系
            roleAnalysisService.deleteBatch(new Long[]{a});
            //保存角色与分析关系
            List<SysRoleAnalysis> analysisIdList = new ArrayList<>(role.getAnalysisIdList().size());
            for (Long viewId : role.getAnalysisIdList()) {
                SysRoleAnalysis fun = new SysRoleAnalysis();
                fun.setAnalysisId(viewId.intValue());
                fun.setRoleId(role.getId());
                analysisIdList.add(fun);
            }
            roleAnalysisService.saveBatch(analysisIdList);


            return new Result<String>(ResultEnum.SECCUSS);
        } else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }


    /**
     * 删除角色
     */
    @RequestMapping("/delete")
    @ResponseBody
    public Result delete(@RequestBody Long[] roleIds) {


        if (roleService.removeByIds(Arrays.asList(roleIds))) {

            //删除角色与菜单关联
            rolePermissionService.deleteBatch(roleIds);

            //删除角色与部门关联
            roleDeptService.deleteBatch(roleIds);

            //删除角色与真实库关联
            roleRealDbService.deleteBatch(roleIds);

            //删除角色与视图库关联
            roleViewService.deleteBatch(roleIds);

            //删除角色与函数关联
            roleFunService.deleteBatch(roleIds);

            //删除角色与虚拟关系
            roleVirtualService.deleteBatch(roleIds);

            //删除角色与分析关系
            roleAnalysisService.deleteBatch(roleIds);

            //删除角色与用户关联
            //    sysUserRoleService.deleteBatch(roleIds);

            return new Result<String>(ResultEnum.SECCUSS);
        } else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }


}
