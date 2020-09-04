
package com.redoop.science.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.redoop.science.entity.VirtualTables;
import com.redoop.science.mapper.VirtualTablesMapper;
import com.redoop.science.service.IVirtualTablesService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * <p>
 * 虚拟表 服务实现类
 * </p>
 *
 * @author Alan
 * @since 2018-09-13
 */
@Service
public class VirtualTablesServiceImpl extends ServiceImpl<VirtualTablesMapper, VirtualTables> implements IVirtualTablesService {


    @Autowired
    VirtualTablesMapper virtualTablesMapper;

    @Override
    public List<VirtualTables> findByRole(Integer id) {
        return virtualTablesMapper.findByRole(id);
    }

    @Override
    public IPage<VirtualTables> pageList(Page<VirtualTables> page, Map<String, Object> params) {
        return virtualTablesMapper.pageList(page,params);
    }

    @Override
    public IPage<VirtualTables> pageListAdmin(Page<VirtualTables> page) {
        return virtualTablesMapper.pageListAdmin(page);
    }
}