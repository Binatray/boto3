
package com.redoop.science.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.redoop.science.entity.SysRoleViewsTables;

import java.util.List;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author admin
 * @since 2018年11月22日12:24:59
 */
public interface ISysRoleViewService extends IService<SysRoleViewsTables> {

    List<Long> queryViewIdList(Long id);

    int deleteBatch(Long[] longs);

    void deleteViewsTables(Integer id);
}