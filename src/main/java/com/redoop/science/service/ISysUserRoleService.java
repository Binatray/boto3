
package com.redoop.science.service;

import com.redoop.science.entity.SysUserRole;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;

/**
 * <p>
 * 用户权限对应表 服务类
 * </p>
 *
 * @author Alan
 * @since 2018-10-29
 */
public interface ISysUserRoleService extends IService<SysUserRole> {

    List<Long> findByRoleIdList(Long id);

    void delete(Integer user_id);

}