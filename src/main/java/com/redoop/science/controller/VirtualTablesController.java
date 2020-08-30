package com.redoop.science.controller;


import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.redoop.science.constant.DBEnum;
import com.redoop.science.dto.ViewsDto;
import com.redoop.science.entity.*;
import com.redoop.science.service.*;
import com.redoop.science.utils.Result;
import com.redoop.science.utils.ResultEnum;
import com.redoop.science.utils.SessionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
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
 * 虚拟表 前端控制器
 * </p>
 *
 * @author Alan
 * @since 2018-09-13
 */
@Controller
@RequestMapping("/virtual")
public class VirtualTablesController {
    @Autowired
    private IVirtualTablesService virtualTablesService;

    @Autowired
    private IRealDbService realDbService;

    @Autowired
    private IViewsService viewsService;

    @Autowired
    private IRegFunctionService regFunctionService;

    @Autowired
    ISysPermissionService sysPermissionService;

    @Autowired
    ISysRoleVirtualService roleVirtualService;

    @Autowired
    ISysUserRoleService userRoleService;

    /**
     * 数据源列表分类
     *
     * @param model
     * @return
     */
    @GetMapping("/{num}")
    public ModelAndView index(Model model, @PathVariable Long num, HttpServletRequest request) {

        Integer id = SessionUtils.getUserId(request);
        Page<VirtualTables> page = new Page<>();
        page.setSize(11L);
        page.setCurrent(num);
        page.setDesc("ID");

        Map<String, Object> params = new HashMap();
        params.put("id", id);

        IPage<VirtualTables> pages = null;


        //根据登录用户id 获取用户拥有角色ID
        List<Long> userRoleIdList = userRoleService.findByRoleIdList(Long.valueOf(id));
        for (Long r :userRoleIdList){
            //判断是否为系统管理员，是则获取所有的列表信息
            if (r.intValue()==1){
                pages =  virtualTablesService.pageListAdmin(page);
            }else {
                //列表(根据角色信息获取)
                pages = virtualTablesService.pageList(page, params);
            }
        }

        //导航栏列表(根据角色信息获取)
        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));

        model.addAttribute("permissionList", permissionList);
        model.addAttribute("nickName", SessionUtils.getUserNickName(request));
        model.addAttribute("items", pages.getRecords());
        // model.addAttribute("activeType", 1);
        model.addAttribute("pageNum", num);
        model.addAttribute("virtual", new VirtualTables());
        model.addAttribute("pages", pages.getPages());
        model.addAttribute("total", pages.getTotal());
        return new ModelAndView("/select/index");
    }


    @RequestMapping("/lists")
    @ResponseBody
    public List<Map<String, Object>> list() {
        List<Map<String, Object>> virtualZList = new ArrayList<>();
        Map<String, Object> vMap = new HashMap<>();
        vMap.put("pId", 0);
        vMap.put("name", "虚拟库");
        vMap.put("icon", "/img/icon/db.png");
        vMap.put("id", 1);
        virtualZList.add(vMap);
        List<VirtualTables> virtualTablesList = virtualTablesService.list(null);
        for (VirtualTables virtualTables : virtualTablesList) {
            Map<String, Object> zMap = new HashMap<>();
            zMap.put("pId", 1);
            zMap.put("name", virtualTables.getName());
            zMap.put("icon", "/img/icon/table.png");
            zMap.put("id", virtualTables.getId());
            virtualZList.add(zMap);
        }
        return virtualZList;
    }


    @GetMapping("/edit/{id}")
    public ModelAndView edit(Model model, @PathVariable(value = "id") String id, HttpServletRequest request) {
        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
        model.addAttribute("permissionList", permissionList);
        VirtualTables virtualTables = virtualTablesService.getById(id);
        if (virtualTables != null) {
            model.addAttribute("virtual", virtualTables);
            //返回值
            getZtree(model, request);
            model.addAttribute("nickName", SessionUtils.getUserNickName(request));
            return new ModelAndView("/select/edit");
        } else {
            model.addAttribute("message", "不存在查询信息");
            return new ModelAndView("/error/404");
        }

    }

    @GetMapping("/add")
    public ModelAndView add(Model model, HttpServletRequest request) {


        getZtree(model, request);
        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
        model.addAttribute("permissionList", permissionList);
        model.addAttribute("nickName", SessionUtils.getUserNickName(request));
        return new ModelAndView("/select/edit");
    }

    /**
     * 加载树
     *
     * @param model
     * @param request
     * @return
     */
    public Model getZtree(Model model, HttpServletRequest request) {

        Integer id = SessionUtils.getUserId(request);

        //  获取ztree json
        // 获取真实库ztreejson
        //List<RealDb> realDbs =  realDbService.list(null);
        List<RealDb> realDbs = realDbService.findByRole(id);

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
            zMap.put("id", realDb.getId() + 10);
            realZList.add(zMap);
        }

        // 获取虚拟库ztreejson
        // 获取虚拟库ztreejson
        List<Map<String, Object>> virtualZList = new ArrayList<>();
        Map<String, Object> vMap = new HashMap<>();
        vMap.put("pId", 0);
        vMap.put("name", "虚拟库");
        vMap.put("icon", "/img/icon/db.png");
        vMap.put("id", 1);
        virtualZList.add(vMap);
        List<VirtualTables> virtualTablesList = virtualTablesService.findByRole(id);
        for (VirtualTables virtualTables : virtualTablesList) {
            Map<String, Object> zMap = new HashMap<>();
            zMap.put("pId", 1);
            zMap.put("name", virtualTables.getName());
            zMap.put("icon", "/img/icon/table.png");
            zMap.put("id", virtualTables.getId() + 10);
            virtualZList.add(zMap);
        }

        //获取视图库
        // List<ViewsDto> views =  viewsService.getViewsTables();
      /*  Map<String,Object> params = new HashMap();
        params.put("id",id);*/
        List<ViewsDto> views = viewsService.findByRole(id);
        //System.out.println("根据id，查对应角色的视图库信息>>>>>>>>"+views);
        List<Map<String, Object>> viewsZList = new ArrayList<>();
        for (ViewsDto v : views) {
            Map<String, Object> zMap = new HashMap<>();
            //第一节点
            zMap.put("pId", 0);
            zMap.put("name", v.getName());
            zMap.put("icon", "/img/icon/view.png");
            zMap.put("id", v.getId());
            viewsZList.add(zMap);

            for (ViewsTables viewsTables : v.getViewsTablesList()) {
                Map<String, Object> z2Map = new HashMap<>();
                z2Map.put("pId", viewsTables.getViewsId());
                z2Map.put("name", viewsTables.getName());
                z2Map.put("icon", "/img/icon/viewTable.png");
                z2Map.put("id", viewsTables.getId() + 10000);
                viewsZList.add(z2Map);
            }
        }


        //函数树
        List<Map<String, Object>> funZList = new ArrayList<>();
        Map<String, Object> fMap = new HashMap<>();
        fMap.put("pId", 0);
        fMap.put("name", "函数库");
        fMap.put("icon", "/img/icon/db.png");
        fMap.put("id", 1);
        funZList.add(fMap);
        List<RegFunction> regFunctionList = regFunctionService.findByRole(id);
        for (RegFunction regFunction : regFunctionList) {
            Map<String, Object> fMap2 = new HashMap<>();
            fMap2.put("pId", 1);
            fMap2.put("name", regFunction.getName());
            fMap2.put("icon", "/img/icon/table.png");
            fMap2.put("id", regFunction.getId() + 10);
            funZList.add(fMap2);
        }


        //返回值
        model.addAttribute("realZList", realZList);
        model.addAttribute("virtualZList", virtualZList);
        model.addAttribute("viewsZList", viewsZList);
        model.addAttribute("funZList", funZList);

        return model;
    }

    @RequestMapping("/delete/{id}")
    @ResponseBody
    public Result<String> delete(@PathVariable Integer id) {
        if (virtualTablesService.removeById(id)) {
            //删除中间表信息
            roleVirtualService.deleteVirtualTables(id);
            return new Result<String>(ResultEnum.SECCUSS);
        } else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }

}
