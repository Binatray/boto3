
package com.redoop.science.controller;


import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.redoop.science.dto.ViewsDto;
import com.redoop.science.entity.*;
import com.redoop.science.service.ISysPermissionService;
import com.redoop.science.service.IViewsService;
import com.redoop.science.service.IViewsTablesService;
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
 * 视图库 前端控制器
 * </p>
 *
 * @author admin
 * @since 2018-09-26
 */
@Controller
@RequestMapping("/views")
public class ViewsController {
    @Autowired
    private IViewsTablesService viewsTablesService;

    @Autowired
    private IViewsService viewsService;

    @Autowired
    ISysPermissionService sysPermissionService;

    @GetMapping("/{num}")
    public ModelAndView index(Model model, @PathVariable Long num, HttpServletRequest request) {

        //获取sessionID(登录用户ID)
        Integer id = SessionUtils.getUserId(request);
        Map<String, Object> params = new HashMap();
        params.put("id", id);


        Page<Views> page = new Page<>();
        page.setSize(11L);
        page.setCurrent(num);
        page.setDesc("ID");

        //列表(根据角色信息获取)
        IPage<Views> pages = viewsService.pageList(page, params);

        List<SysPermission> permissionList = sysPermissionService.findByPermission(id);
        model.addAttribute("permissionList", permissionList);
        model.addAttribute("nickName", SessionUtils.getUserNickName(request));
        model.addAttribute("items", pages.getRecords());
        //model.addAttribute("activeType", 5);
        model.addAttribute("pageNum", num);
        model.addAttribute("views", new Views());
        model.addAttribute("pages", pages.getPages());
        model.addAttribute("total", pages.getTotal());

        return new ModelAndView("/views/viewsIndex");
    }

    @RequestMapping("/lists")
    @ResponseBody
    public List<Map<String, Object>> list() {

        //获取视图库
        List<ViewsDto> views = viewsService.getViewsTables();
        System.out.println("获取视图库>>>>>>>>>" + views);
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
                z2Map.put("id", viewsTables.getId());
                viewsZList.add(z2Map);
            }
        }
        return viewsZList;
    }


    @GetMapping("/addView")
    public ModelAndView addView(Model model, HttpServletRequest request) {
        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
        model.addAttribute("permissionList", permissionList);
        model.addAttribute("nickName", SessionUtils.getUserNickName(request));
        return new ModelAndView("/views/viewsAdd");
    }

    /**
     * 保存视图库
     *
     * @param request
     * @param id
     * @param viewsName
     * @return
     */
    @PostMapping("/saveView")
    @ResponseBody
    public Result saveView(HttpServletRequest request, @RequestParam(name = "id", required = false) Long id, @RequestParam(value = "viewsName") String viewsName) {

        Views views = null;
        SysUserDetails sysUser = SessionUtils.getUser(request);
        QueryWrapper queryWrapper = new QueryWrapper();
        queryWrapper.eq("NAME", viewsName);

        if (id != null) {
            views = viewsService.getById(id);
        } else {
            Views virtualTable = viewsService.getOne(queryWrapper);
            if (virtualTable != null) {
                return new Result(ResultEnum.REPEAT_VIEW, "名称已存在，请使用其他名称");
            } else {
                views = new Views();
                views.setName(viewsName);
                views.setCreateDate(LocalDateTime.now());
                views.setCreatorId(sysUser.getId());
                views.setCreatorName(sysUser.getNickname());
            }
        }
        if (viewsService.save(views)) {
            return new Result<String>(ResultEnum.SECCUSS);
        } else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }

    @RequestMapping("/delete/{id}")
    @ResponseBody
    public Result<String> delete(@PathVariable Integer id) {
        if (viewsService.removeById(id)) {
            return new Result<String>(ResultEnum.SECCUSS);
        } else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }

    @RequestMapping(value = "/edit/{id}", method = RequestMethod.GET)
    public ModelAndView edit(Model model, @PathVariable(value = "id") String id, HttpServletRequest request) {
        List<SysPermission> permissionList = sysPermissionService.findByPermission(SessionUtils.getUserId(request));
        model.addAttribute("permissionList", permissionList);
        Views views = viewsService.getById(id);
        if (views != null) {
            model.addAttribute("views", views);
            model.addAttribute("nickName", SessionUtils.getUserNickName(request));
            return new ModelAndView("/views/viewsUpdate");
        } else {
            return new ModelAndView("/error/500");
        }
    }


}