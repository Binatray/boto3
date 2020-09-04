package com.redoop.science.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.redoop.science.entity.SysRolePermission;
import com.redoop.science.entity.SysRoleRealDb;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * <p>
 *  Mapper 接口
 * </p>
 *
 * @author admin
 * @since 2018年11月21日15:12:08
 */
public interface SysRoleRealDbMapper extends BaseMapper<SysRoleRealDb> {


    //@Select("select PERMISSION_ID from sys_role_permission where ROLE_ID = #{id}")
    @Select(" select REAL_DB_ID from sys_role_real_db where ROLE_ID = #{id}")
    List<Long> findById(Long id);



    int deleteBatch(Long[] roleIds);

    @Delete("delete from sys_role_real_db where REAL_DB_ID = #{id}")
    void deleteDb(Integer id);
}
