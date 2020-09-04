package com.redoop.science.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.redoop.science.entity.SysDept;

import java.util.HashMap;
import java.util.List;

/**
 * <p>
 * 部门 服务类
 * </p>
 *
 * @author admin
 * @since 2018年11月6日15:30:50
 */
public interface ISysDeptService extends IService<SysDept> {

    List<Integer> queryDetpIdList(Integer id);
}
