package com.redoop.science.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.redoop.science.entity.SysRoleFunction;
import com.redoop.science.mapper.SysRoleFunMapper;
import com.redoop.science.service.ISysRoleFunService;
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
public class SysRoleFunServiceImpl extends ServiceImpl<SysRoleFunMapper, SysRoleFunction> implements ISysRoleFunService {


    @Autowired
    SysRoleFunMapper roleFunMapper;

   @Override
    public List<Long> queryFunIdList(Long id) {
        return roleFunMapper.findById(id);
    }

    @Override
    public int deleteBatch(Long[] roleIds){
        return baseMapper.deleteBatch(roleIds);
    }

    @Override
    public void deleteFunId(Integer id) {
        baseMapper.deleteFunId(id);
    }
}
