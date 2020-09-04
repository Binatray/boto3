package com.redoop.science.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.redoop.science.entity.VirtualTables;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;
import java.util.Map;

/**
 * <p>
 * 虚拟表 服务类
 * </p>
 *
 * @author Alan
 * @since 2018-09-13
 */
public interface IVirtualTablesService extends IService<VirtualTables> {

    List<VirtualTables> findByRole(Integer id);

    IPage<VirtualTables> pageList(Page<VirtualTables> page, Map<String, Object> params);

    IPage<VirtualTables> pageListAdmin(Page<VirtualTables> page);
}
