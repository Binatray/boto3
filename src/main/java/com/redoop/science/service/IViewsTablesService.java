package com.redoop.science.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.redoop.science.entity.ViewsTables;

import java.util.Map;

/**
 * <p>
 *  视图表
 * </p>
 *
 * @author admin
 * @since 2018年10月16日11:22:19
 */
public interface IViewsTablesService extends IService<ViewsTables> {


    String getByName(String dbName);

    IPage<ViewsTables> pageList(Page<ViewsTables> page, Map<String, Object> params);

    IPage<ViewsTables> pageListAdmin(Page<ViewsTables> page);
}
