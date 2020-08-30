package com.redoop.science.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.redoop.science.dto.ViewsDto;
import com.redoop.science.entity.*;
import com.redoop.science.service.*;
import com.redoop.science.utils.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * <p>
 * 视图表 前端控制器
 * </p>
 *
 * @author admin
 * @since 2018-09-26
 */
@Controller
@RequestMapping("/viewsTables")
public class ViewsTablesController {
    @Autowired
    private IViewsTablesService viewsTablesService;

    @Autowired
    private IViewsService viewsService;

    @Autowired
    ISysPermissionService sysPermissionService;
    @Autowired
    ISysRoleViewService roleViewService;
    @Autowired
    ISysUserRoleService userRoleService;
    /**
     * 视图表
     *
     * @param model
     * @param num
     * @param request
     * @return
     */
    @GetMapping("/{num}")
    public ModelAndView index(Model model, @PathVariable Long num, HttpServletRequest request) {

        Integer id = SessionUtils.getUserId(request);

        Page<ViewsTables> page = new Page<>();

        page.setSize(11L);
        page.setCurrent(num);
        page.setDesc("ID");

        Map<String, Object> params = new HashMap();
        params.put("id", id);

        IPage<ViewsTables> pages =null;
        //根据登录用户id 获取用户拥有角色ID
        List<Long> userRoleIdList = userRoleService.findByRoleIdList(Long.valueOf(id));
        for (Long r :userRoleIdList){
            //判断是否为系统管理员，是则获取所有的列表信息
            if (r.intValue()==1){
                pages =  viewsTablesService.pageListAdmin(page);
            }else {
                //列表(根据角色信息获取)
                pages = viewsTablesService.pageList(page, params);
            }
        }

       // IPage<ViewsTables> pages = viewsTablesService.pageList(page, params);

        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));

        model.addAttribute("permissionList", permissionList);
        model.addAttribute("nickName", SessionUtils.getUserNickName(request));
        model.addAttribute("items", pages.getRecords());
        //model.addAttribute("activeType", 4);
        model.addAttribute("pageNum", num);
        model.addAttribute("viewsTables", new ViewsTables());
        model.addAttribute("pages", pages.getPages());
        model.addAttribute("total", pages.getTotal());

        return new ModelAndView("/views/index");
    }

    /**
     * 去添加视图表
     *
     * @param model
     * @param request
     * @return
     */
    @GetMapping("/add")
    public ModelAndView add(Model model, HttpServletRequest request) {

        List<ViewsDto> views = viewsService.getViewsTables();
        getZtree(model);
        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
       // List<SysPermission> permissionList = sysPermissionService.getTpyeList();
        model.addAttribute("permissionList", permissionList);
        model.addAttribute("nickName", SessionUtils.getUserNickName(request));
        model.addAttribute("select", views);

        return new ModelAndView("/views/add");
    }

    /**
     * 保存视图表
     *
     * @param request
     * @param id
     * @param sql
     * @param sqlName
     * @param vId
     * @return
     */
    @PostMapping("/save")
    @ResponseBody
    public Result save(HttpServletRequest request,
                       @RequestParam(name = "id", required = false) Integer id,
                       @RequestParam(name = "sql") String sql,
                       @RequestParam(value = "sqlName") String sqlName,
                       @RequestParam(name = "vId") Integer vId/*,
                       @RequestParam(value = "viewsName") String viewsName*/) {


        ViewsTables tables = null;

        SysUserDetails sysUser = SessionUtils.getUser(request);

        QueryWrapper queryWrapper = new QueryWrapper();
        queryWrapper.eq("NAME", sqlName);

        if (id != null) {
            tables = viewsTablesService.getById(id);
        } else {

            ViewsTables virtualTable = viewsTablesService.getOne(queryWrapper);

            if (virtualTable != null) {
                return new Result(ResultEnum.REPEAT, "名称已存在，请使用其他名称");
            } else {
                tables = new ViewsTables();
                tables.setCreateDate(LocalDateTime.now());
                tables.setCreatorId(sysUser.getId());
                tables.setCreatorName(sysUser.getNickname());
            }
            if (vId == null || vId == 0) {
                return new Result(ResultEnum.NOT_VIEW, "目前没有视图库，请创建视图库");
            }

        }

        if (vId != 0) {
            //保存下拉vid(视图库id)
            tables.setViewsId(vId);
        }
        /*tables.setViewsName(viewsName);*/
        tables.setCode(sql);
        tables.setName(sqlName);
        tables.setOperationTime(LocalDateTime.now());
        tables.setOperationId(sysUser.getId());

        if (viewsTablesService.save(tables)) {

            //将本角色下用户创建的信息，保存至中间表中，方便本角色下所有的用户访问
            List<Long> roleIdList = userRoleService.findByRoleIdList(Long.valueOf(SessionUtils.getUserId(request)));
            List<SysRoleViewsTables> list = new ArrayList<>(SessionUtils.getUserId(request));
            for (Long roleId : roleIdList) {
                SysRoleViewsTables sysRoleViewsTables = new SysRoleViewsTables();
                sysRoleViewsTables.setViewTablesId(tables.getId());
                sysRoleViewsTables.setRoleId(roleId.intValue());
                list.add(sysRoleViewsTables);
            }
            //System.out.println("list》》》》》》"+list);
            roleViewService.saveBatch(list);

            return new Result<String>(ResultEnum.SECCUSS);
        } else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }

    /**
     * @param model
     * @param id
     * @param request
     * @return
     */
    @RequestMapping(value = "/edit/{id}", method = RequestMethod.GET)
    public ModelAndView edit(Model model, @PathVariable(value = "id") String id, HttpServletRequest request) {

        List<ViewsDto> views = viewsService.getViewsTables();
        ViewsTables viewsTables = viewsTablesService.getById(id);
        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
        model.addAttribute("permissionList", permissionList);

        model.addAttribute("select", views);
        if (viewsTables != null) {
            getZtree(model);
            model.addAttribute("viewsLists", viewsTables);
            model.addAttribute("nickName", SessionUtils.getUserNickName(request));
            return new ModelAndView("/views/update");
        } else {
            return new ModelAndView("/error/500");
        }
    }


    /**
     * 获取树
     *
     * @param model
     * @return
     */
    public Model getZtree(Model model) {
        //  获取ztree json
        // 获取真实库ztreejson

        List<ViewsDto> views = viewsService.getViewsTables();

        List<Map<String, Object>> realZList = new ArrayList<>();
        for (ViewsDto v : views) {

            Map<String, Object> zMap = new HashMap<>();
            //第一节点
            zMap.put("pId", 0);
            zMap.put("name", v.getName());
            zMap.put("icon", "/img/icon/view.png");
            zMap.put("id", v.getId());
            realZList.add(zMap);

            for (ViewsTables viewsTables : v.getViewsTablesList()) {
                Map<String, Object> z2Map = new HashMap<>();
                z2Map.put("pId", viewsTables.getViewsId());
                z2Map.put("name", viewsTables.getName());
                z2Map.put("icon", "/img/icon/viewTable.png");
                z2Map.put("id", viewsTables.getId() + 10000);
                realZList.add(z2Map);
            }
        }

        //System.out.println("realZList>>>>>"+realZList);
        //返回值
        model.addAttribute("realZList", realZList);

        return model;
    }


    /**
     * 执行sql查询
     *
     * @return
     */
    /*@PostMapping("/script")
    @ResponseBody
    public Result<String> script(@RequestParam(value = "sql") String sql) {
        Result<String> stringResult = new Result<>(ResultEnum.FAIL);
        String result = "";
        try {
            String runSql = ParseSql.parseSql(sql);
            HttpUrl url = new HttpUrl.Builder()
                    .scheme("http")
                    .host("192.168.0.122")
                    .port(9003)
                    .addPathSegments("run\\script")
                    .addQueryParameter("sql", runSql)
                    .build();
            String sqlResult = HttpClient.httpPost(url, "");
            result = sqlResult;
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println("resultresultresult>>>>>"+result);

        if(JsonUtil.isJSONValid(result)){
            stringResult = new Result<String>(ResultEnum.SECCUSS,result);
        }else{
            stringResult = new Result<String>(ResultEnum.FAIL,result);
        }
        return stringResult;
    }*/
    @RequestMapping("/delete/{id}")
    @ResponseBody
    public Result