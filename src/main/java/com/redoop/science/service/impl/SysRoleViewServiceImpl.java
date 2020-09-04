package com.redoop.science.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.redoop.science.entity.SysRoleViewsTables;
import com.redoop.science.mapper.SysRoleViewMapper;
import com.redoop.science.service.ISysRoleViewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
public class SysRoleViewServiceImpl extends ServiceImpl<SysRoleViewMapper, SysRoleViewsTables> implements ISysRoleViewService {


    @Autowired
    SysRoleViewMapper roleViewMapper;

   @Override
    public List<Long> queryViewIdList(Long id) {
        return roleViewMapper.findById(id);
    }

    @Override
    public int deleteBatch(Long[] roleIds){
        return baseMapper.deleteBatch(roleIds);
    }

    @Override
    public void deleteViewsTables(Integer id) {
        baseMapper.deleteViewsTables(id);
    }
}
