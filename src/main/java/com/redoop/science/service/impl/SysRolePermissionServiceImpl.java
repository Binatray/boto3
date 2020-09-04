package com.redoop.science.service.impl;

import com.redoop.science.entity.SysRolePermission;
import com.redoop.science.mapper.SysRolePermissionMapper;
import com.redoop.science.service.ISysRolePermissionService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author Alan
 * @since 2018-11-05
 */
@Service
public class SysRolePermissionServiceImpl extends ServiceImpl<SysRolePermissionMapper, SysRolePermission> implements ISysRolePermissionService {


    @Autowired
    SysRolePermissionMapper rolePermissionMapper;

    @Override
    public List<Long> queryMenuIdList(Long id) {
        return rolePermissionMapper.findById(id);
    }

    @Override
    public int deleteBatch(Long[] roleIds){
        return baseMapper.deleteBatch(roleIds);
    }
}
