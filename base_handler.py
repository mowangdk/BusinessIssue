#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time  :  2018/1/11 下午12:40
import json
import logging
from tornado.web import RequestHandler
from tsp import tsp_dp, tsp_dp_with_path
from tornado.web import HTTPError


class BaseHandler(RequestHandler):
    def get(self):
        self.render('drawPoints.html')


class BaseHandlerWithPath(RequestHandler):
    def get(self):
        self.render('drawPointsWithPath.html')


class CalculateHandler(RequestHandler):
    def post(self):
        points = json.loads(self.get_argument('points'))
        d = int(self.get_argument('d'))
        unit = self.get_argument('unit')
        restriction = json.loads(self.get_argument('restriction', '[]'))
        logging.info('got restrictions: %s' % restriction)
        status = 0
        try:
            shortest_distance, route, num_routes = tsp_dp(points, d, restriction)
            msg = 'Num of routes is: %s' % num_routes
            logging.info(msg)
        except ValueError:
            status = 1
            msg = 'No available routes because too many restrictions!'
            shortest_distance = 0
            route = []
        shortest_distance = '%.2f' % (shortest_distance) + ' ' + unit
        data = dict(shortest_distance=shortest_distance, route=route, restriction=restriction, status=status, msg=msg)
        self.write(data)
        self.finish()


class CalculateHandlerWithPath(RequestHandler):
    def post(self):
        points = json.loads(self.get_argument('points'))
        d = int(self.get_argument('d'))
        unit = self.get_argument('unit')
        restriction = json.loads(self.get_argument('restriction', '[]'))
        logging.info('got paths: %s' % restriction)
        status = 0
        try:
            shortest_distance, route, num_routes = tsp_dp_with_path(points, d, restriction)
            msg = 'Num of routes is: %s' % num_routes
            logging.info(msg)
        except ValueError:
            status = 1
            msg = 'No available routes because too less paths!'
            shortest_distance = 0
            route = []
        shortest_distance = '%.2f' % (shortest_distance) + ' ' + unit
        data = dict(shortest_distance=shortest_distance, route=route, restriction=restriction, status=status, msg=msg)
        self.write(data)
        self.finish()


class DownloadRoutePictureHandler(RequestHandler):
    def get(self):
        filename = self.get_argument('filename', '')
        logging.info('i download file handler: {}'.format(filename))
        self.set_header('Content-Type', 'application/octet-stream')
        self.set_header('Content-Disposition', 'attachment; filename='+filename)
        with open(filename, 'r') as f:
            while True:
                data = f.read(1000)
                if not data:
                    break
                self.write(data)
        self.finish()