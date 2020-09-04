package com.redoop.science.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.redoop.science.entity.SysRoleDept;
import com.redoop.science.entity.SysRolePermission;
import com.redoop.science.mapper.SysRoleDeptMapper;
import com.redoop.science.service.ISysRoleDeptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * <p>
 *  角色_部门 服务实现类
 * </p>
 *
 * @author admin
 * @since 2018年11月6日15:33:15
 */
@Service
public class SysRoleDeptServiceImpl extends ServiceImpl<SysRoleDeptMapper, SysRoleDept> implements ISysRoleDeptService {

    @Autowired
    SysRoleDeptMapper roleDeptMapper;


    @Override
    public List<Long> queryDeptIdList(Long[] roleIds) {
        return roleDeptMapper.queryDeptIdList(roleIds);
    }

    @Override
    public int deleteBatch(Long[] roleIds) {

        return baseMapper.deleteBatch(roleIds);
    }
}
