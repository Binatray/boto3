
package com.redoop.science.service.impl;

import com.redoop.science.entity.SysUserRole;
import com.redoop.science.mapper.SysUserRoleMapper;
import com.redoop.science.service.ISysUserRoleService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * <p>
 * 用户权限对应表 服务实现类
 * </p>
 *
 * @author Alan
 * @since 2018-10-29
 */
@Service
public class SysUserRoleServiceImpl extends ServiceImpl<SysUserRoleMapper, SysUserRole> implements ISysUserRoleService {

    @Autowired
    SysUserRoleMapper sysUserRoleMapper;

    @Override
    public List<Long> findByRoleIdList(Long id) {
        return sysUserRoleMapper.findByRoleId(id);
    }

    @Override
    public void delete(Integer user_id) {
        sysUserRoleMapper.deleteUserId(user_id);
    }
}