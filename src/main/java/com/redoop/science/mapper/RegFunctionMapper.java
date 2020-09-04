
package com.redoop.science.mapper;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.redoop.science.entity.RegFunction;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * <p>
 * 注册函数 Mapper 接口
 * </p>
 *
 * @author Alan
 * @since 2018-10-16
 */
public interface RegFunctionMapper extends BaseMapper<RegFunction> {

    @Select("select CODE from reg_function where NAME =#{name} ")
    String findByName(String name);

    IPage<RegFunction> findByRole(Page<RegFunction> page,  @Param("params")Map<String, Object> params);

   /* @Select("SELECT a.* FROM real_db a " +
            "LEFT JOIN sys_role_real_db b on a.ID = b.REAL_DB_ID " +
            "LEFT JOIN sys_user_role c on b.ROLE_ID = c.ROLE_ID " +
            "WHERE c.USER_ID =#{id} and a.ID  is not NULL")*/
    @Select(" SELECT DISTINCT a.* FROM reg_function a" +
            " LEFT JOIN sys_role_function b on a.ID = b.FUNCTION_ID" +
            " LEFT JOIN sys_user_role c ON b.ROLE_ID = c.ROLE_ID " +
            "where c.USER_ID =#{id} and a.ID  is not NULL ")
    List<RegFunction> findByRoleUserId(Integer id);

    IPage<RegFunction> pageListAdmin(Page<RegFunction> page);
}