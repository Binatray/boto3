package com.redoop.science.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.redoop.science.common.Constant;
import com.redoop.science.common.DataFilter;
import com.redoop.science.entity.SysDept;
import com.redoop.science.mapper.SysDeptMapper;
import com.redoop.science.service.ISysDeptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * <p>
 *  部门--角色 服务实现类
 * </p>
 *
 * @author admin
 * @since 2018年11月6日15:33:15
 */
@Service
public class SysDeptServiceImpl extends ServiceImpl<SysDeptMapper, SysDept> implements ISysDeptService {

    @Autowired
    SysDeptMapper deptMapper;


    @Override
    public List<Integer> queryDetpIdList(Integer id) {
        return deptMapper.getDetpIdList(id);
    }

}

