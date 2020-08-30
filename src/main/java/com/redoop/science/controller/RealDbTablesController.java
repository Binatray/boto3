package com.redoop.science.controller;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.redoop.science.entity.RealDbTables;
import com.redoop.science.service.IRealDbTablesService;
import com.redoop.science.utils.Result;
import com.redoop.science.utils.ResultEnum;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * <p>
 * 真实数据库表 前端控制器
 * </p>
 *
 * @author Alan
 * @since 2018-09-13
 */
@Controller
@RequestMapping("/real-db-tables")
public class RealDbTablesController {
    @Autowired
    private IRealDbTablesService realDbTablesService;

    /**
     * 数据源列表分类
     * @param model
     * @return
     */
    @GetMapping
    public String index(Model model){
        LambdaQueryWrapper<RealDbTables> wrapper = new LambdaQueryWrapper<>();
        List<RealDbTables> list = realDbTablesService.list(wrapper);
        model.addAttribute("list", list);
        return "";
    }

    @PostMapping("/save")
    public Result<String> save(RealDbTables realDbTables){
        if (realDbTablesService.save(realDbTables)){
            return new Result<String>(ResultEnum.SECCUSS);
        }else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }
    @PostMapping("/update")
    public Result<String> update(RealDbTables realDbTables){
        if (realDbTablesService.updateById(realDbTables)){
            return new Result<String>(ResultEnum.SECCUSS);
        }else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }
    @PostMapping("/delete")
    public Result<String> delete(Long id){
        if (realDbTablesService.removeById(id)){
            return new Result<String>(ResultEnum.SECCUSS);
        }else {
            return new Result<String>(ResultEnum.FAIL);
        }
    }

}
