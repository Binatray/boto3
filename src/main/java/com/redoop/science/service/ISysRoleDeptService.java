
package com.redoop.science.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.redoop.science.entity.SysRoleDept;

import java.util.List;

/**
 * <p>
 * 部门--角色 服务类
 * </p>
 *
 * @author admin
 * @since 2018年11月6日15:31:30
 */
public interface ISysRoleDeptService extends IService<SysRoleDept> {

    List<Long> queryDeptIdList(Long[] roleIds);

    int deleteBatch(Long[] longs);
}