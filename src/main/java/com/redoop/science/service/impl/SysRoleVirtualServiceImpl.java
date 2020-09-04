package com.redoop.science.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.redoop.science.entity.SysRoleVirtualTables;
import com.redoop.science.mapper.SysRoleVirtualMapper;
import com.redoop.science.service.ISysRoleVirtualService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author admin
 * @since 2018年11月22日14:51:04
 */
@Service
public class SysRoleVirtualServiceImpl extends ServiceImpl<SysRoleVirtualMapper, SysRoleVirtualTables> implements ISysRoleVirtualService {


    @Autowired
    SysRoleVirtualMapper roleVirtualMapper;

   @Override
    public List<Long> queryVirtualIdList(Long id) {
        return roleVirtualMapper.findById(id);
    }

    @Override
    public int deleteBatch(Long[] roleIds){
        return baseMapper.deleteBatch(roleIds);
    }

    /**
     * 根据VirtualTablesId删除角色与虚拟的关系
     * @param id
     */
    @Override
    public void deleteVirtualTables(Integer id) {
        baseMapper.deleteVirtualTables(id);
    }
}
