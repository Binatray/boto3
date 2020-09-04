
package com.redoop.science.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.redoop.science.entity.SysRoleRealDb;
import com.redoop.science.mapper.SysRoleRealDbMapper;
import com.redoop.science.service.ISysRoleRealDbService;
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
public class SysRoleRealDbServiceImpl extends ServiceImpl<SysRoleRealDbMapper, SysRoleRealDb> implements ISysRoleRealDbService {


    @Autowired
    SysRoleRealDbMapper roleRealDbMapper;

   @Override
    public List<Long> queryReadDbIdList(Long id) {
        return roleRealDbMapper.findById(id);
    }

    @Override
    public int deleteBatch(Long[] roleIds){
        return baseMapper.deleteBatch(roleIds);
    }

    @Override
    public void deleteDb(Integer id) {
        baseMapper.deleteDb(id);
    }
}