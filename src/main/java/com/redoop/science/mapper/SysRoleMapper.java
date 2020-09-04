
package com.redoop.science.mapper;

import com.redoop.science.entity.SysRole;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * <p>
 * 系统权限 Mapper 接口
 * </p>
 *
 * @author Alan
 * @since 2018-10-29
 */
public interface SysRoleMapper extends BaseMapper<SysRole> {
    /**
     * 根据用户ID 查询权限集合
     * @param userId
     * @return
     */
    List<SysRole> findByUserId(@Param("userId")Integer userId);

    /**
     * 获取资源的所有权限
     * @param permissionId
     * @return
     */
    List<String> findByPermissionId(@Param("permissionId")Integer permissionId);
}