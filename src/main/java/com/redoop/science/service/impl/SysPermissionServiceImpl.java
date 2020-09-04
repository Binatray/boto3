package com.redoop.science.service.impl;

import com.redoop.science.dto.sys.SysPermissionDto;
import com.redoop.science.entity.SysPermission;
import com.redoop.science.mapper.SysPermissionMapper;
import com.redoop.science.service.ISysPermissionService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author Alan
 * @since 2018-11-05
 */
@Service
public class SysPermissionServiceImpl extends ServiceImpl<SysPermissionMapper, SysPermission> implements ISysPermissionService {



    @Override
    public List<SysPermission> getNotButtonList() {
        return baseMapper.findNotButtonList();
    }

    @Override
    public List<SysPermission> getListParentId(Integer id) {
        return baseMapper.findListParentId(id);
    }

//    @Override
//    public List<SysPermission> getTpyeList() {
//        return baseMapper.findTypeList();
//    }

    @Override
    public List<SysPermissionDto> getSysPermissionDto() {
        return baseMapper.findListPermissionDto();
    }

    /**
     * 根据登录用户的sessionId查询 所拥有的权限 目录导航菜单
     * @param id
     * @return
     */
    @Override
    public List<SysPermission> findByPermission(Integer id) {
        return baseMapper.findByPermission(id);
    }
}
