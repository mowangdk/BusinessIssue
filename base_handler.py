#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time  :  2018/1/11 下午12:40
import json
import logging
from tornado.web import RequestHandler
from tsp import tsp_dp
from tornado.web import HTTPError


class BaseHandler(RequestHandler):
    def get(self):
        self.render('shortestPath.html')


class CalculateHandler(RequestHandler):
    def post(self):
        points = json.loads(self.get_argument('points'))
        d = int(self.get_argument('d'))
        unit = self.get_argument('unit')
        restriction = json.loads(self.get_argument('restriction', '[]'))
        try:
            shortest_distance, route = tsp_dp(points, d, restriction)
        except ValueError:
            raise HTTPError(400, 'No available routes because too many restrictions!')
        shortest_distance = '%.2f' % (shortest_distance) + ' ' + unit
        data = dict(shortest_distance=shortest_distance, route=route, restriction=restriction)
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