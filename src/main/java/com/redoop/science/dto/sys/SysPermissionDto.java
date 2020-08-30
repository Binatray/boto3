package com.redoop.science.dto.sys;

import com.redoop.science.entity.SysPermission;
import lombok.Data;

import java.util.List;

/**
 * @Author: Alan
 * @Time: 2018/11/19 10:13
 * @Description:
 */
@Data
public class SysPermissionDto extends SysPermission {
    private List<String> roles;
}
