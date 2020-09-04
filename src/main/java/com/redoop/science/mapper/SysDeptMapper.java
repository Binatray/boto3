package com.redoop.science.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.redoop.science.entity.SysDept;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * <p>
 *  部门--角色 Mapper 接口
 * </p>
 *
 * @author admin
 * @since 2018年11月6日15:35:54
 */
public interface SysDeptMapper extends BaseMapper<SysDept> {


    @Select("select ID from sys_dept where PID = #{deptId} and del_flag = 0")
    List<Integer> getDetpIdList(Integer id);
}
