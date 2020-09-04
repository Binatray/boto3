package com.redoop.science.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.redoop.science.entity.SysRoleAnalysis;
import com.redoop.science.entity.SysRoleFunction;
import com.redoop.science.mapper.SysRoleAnalysisMapper;
import com.redoop.science.mapper.SysRoleFunMapper;
import com.redoop.science.service.ISysRoleAnalysisService;
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
public class SysRoleAnalysisServiceImpl extends ServiceImpl<SysRoleAnalysisMapper, SysRoleAnalysis> implements ISysRoleAnalysisService {


    @Autowired
    SysRoleAnalysisMapper roleAnalysisMapper;

   @Override
    public List<Long> queryAnalysisIdList(Long id) {
        return roleAnalysisMapper.findById(id);
    }

    @Override
    public int deleteBatch(Long[] roleIds){
        return baseMapper.deleteBatch(roleIds);
    }


    @Override
    public void deleteAnalysis(Integer id) {
        roleAnalysisMapper.deleteAnalysis(id);
    }
}
