
package com.redoop.science.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * @Author: Alan
 * @Time: 2018/10/30 9:40
 * @Description:
 */
@Controller
public class LoginController {
    @GetMapping("/login")
    public String login() {
        return "/login";
    }

    @GetMapping("/")
    public String root() {
        return "redirect:/analysis/1";
    }

    @GetMapping("/401")
    public String http401() {
        return "/error/401";
    }

    @GetMapping("/404")
    public String http404() {
        return "/error/404";
    }
}