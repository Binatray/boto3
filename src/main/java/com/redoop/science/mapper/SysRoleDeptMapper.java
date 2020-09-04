package com.redoop.science.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.redoop.science.entity.SysRoleDept;
import org.apache.ibatis.annotations.Insert;

import java.util.List;

/**
 * <p>
 * 角色__部门 Mapper 接口
 * </p>
 *
 * @author admin
 * @since 2018年11月6日15:35:54
 */
public interface SysRoleDeptMapper extends BaseMapper<SysRoleDept> {


    List<Long> queryDeptIdList(Long[] roleIds);

    int deleteBatch(Long[] roleIds);

}
