#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time  :  2018/1/11 上午11:12


def get():
    routes = [
        (r'/', 'base_handler.BaseHandler'),
        (r'/with_path', 'base_handler.BaseHandlerWithPath'),
        (r'/acquire_route', 'base_handler.CalculateHandler'),
        (r'/acquire_route_with_path', 'base_handler.CalculateHandlerWithPath'),
        (r'/download_picture', 'base_handler.DownloadRoutePictureHandler')
    ]
    return routes
