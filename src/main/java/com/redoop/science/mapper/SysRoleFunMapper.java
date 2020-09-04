package com.redoop.science.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.redoop.science.entity.SysRoleFunction;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * <p>
 *  Mapper 接口
 * </p>
 *
 * @author admin
 * @since 2018年11月22日12:28:23
 */
public interface SysRoleFunMapper extends BaseMapper<SysRoleFunction> {


    @Select(" select FUNCTION_ID from sys_role_function where ROLE_ID = #{id}")
    List<Long> findById(Long id);

    int deleteBatch(Long[] roleIds);

    @Delete("delete from sys_role_function where FUNCTION_ID =#{id} ")
    void deleteFunId(Integer id);
}
