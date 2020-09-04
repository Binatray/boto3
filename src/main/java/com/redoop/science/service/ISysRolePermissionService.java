package com.redoop.science.service;

import com.redoop.science.entity.SysRolePermission;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author Alan
 * @since 2018-11-05
 */
public interface ISysRolePermissionService extends IService<SysRolePermission> {

    List<Long> queryMenuIdList(Long id);

    int deleteBatch(Long[] longs);
}
