
package com.redoop.science.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.redoop.science.entity.SysRoleAnalysis;
import com.redoop.science.entity.SysRoleFunction;

import java.util.List;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author admin
 * @since 2018年11月22日12:24:59
 */
public interface ISysRoleAnalysisService extends IService<SysRoleAnalysis> {

    List<Long> queryAnalysisIdList(Long id);

    int deleteBatch(Long[] longs);

    void deleteAnalysis(Integer id);
}