
package com.redoop.science.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.redoop.science.entity.ProcessG6;
import com.redoop.science.mapper.ProcessG6Mapper;
import com.redoop.science.service.IProcessG6Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;


/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author admin
 * @since 2018-09-26
 */
@Service
public class ProcessG6ServiceImpl extends ServiceImpl<ProcessG6Mapper, ProcessG6> implements IProcessG6Service {


    @Autowired
    ProcessG6Mapper porocessG6Mapper;

    @Override
    public String getId(Integer id) {
        return porocessG6Mapper.findByCode(id);
    }

    @Override
    public IPage<ProcessG6> pageList(Page<ProcessG6> page, Map<String, Object> params) {
        return porocessG6Mapper.pageList(page,params);
    }

    @Override
    public IPage<ProcessG6> pageListAdmin(Page<ProcessG6> page) {
        return porocessG6Mapper.pageListAdmin(page);
    }
}