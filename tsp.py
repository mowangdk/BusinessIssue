#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time : 2018/1/10 下午7:20
# @Author : Sui Chen
import math

import logging


def distance(point, other):
    return math.sqrt((point[0] - other[0]) ** 2 + (point[1] - other[1]) ** 2)


def parse_lines(lines, points):
    index_dict = dict()
    for index, point in enumerate(points):
        index_dict[tuple(point)] = index
    new_lines = set()
    for single_restriction in lines:
        try:
            i = index_dict[tuple(single_restriction[0])]
            j = index_dict[tuple(single_restriction[1])]
            new_lines.add((i, j))
            new_lines.add((j, i))
        except KeyError:
            logging.info('Cannot find point in restriction: %s' % (single_restriction))
    return new_lines


def get_distances(points, restriction):
    n = len(points)
    distances = [[0] * n for _ in range(n)]
    restriction = parse_lines(restriction, points)
    for i in range(n):
        for j in range(n):
            if i != j and (i, j) not in restriction:
                distances[i][j] = distance(points[i], points[j])
            else:
                distances[i][j] = float('inf')
    return distances


def get_distances_with_path(points, path):
    n = len(points)
    distances = [[0] * n for _ in range(n)]
    path = parse_lines(path, points)
    for i in range(n):
        for j in range(n):
            if i != j and (i, j) in path:
                distances[i][j] = distance(points[i], points[j])
            else:
                distances[i][j] = float('inf')
    return distances


def tsp_dp(points, d, restriction):
    distances = get_distances(points, restriction)
    m = len(points)
    n = 2 ** (m-1)
    dp = [[float('inf')] * n for _ in range(m)]
    num_routes = [[0] * n for _ in range(m)]
    for i in range(m):
        dp[i][0] = distances[i][0]
        if distances[i][0] != float('inf'):
            num_routes[i][0] = 1
    routes = [[0] * n for _ in range(m)]
    for j in range(1, n):
        for i in range(m):
            # already arrived in j
            if i > 0 and (j >> (i-1)) & 1:
                continue
            for k in range(1, m):
                if (j >> (k-1)) & 1 == 0:
                    continue
                rest = j ^ (1 << (k-1))
                if distances[i][k] + dp[k][rest] < dp[i][j]:
                    dp[i][j] = distances[i][k] + dp[k][rest]
                    routes[i][j] = k
                if distances[i][k] != float("inf"):
                    num_routes[i][j] += num_routes[k][rest]
    final_route = list()
    final_route.append(points[0])
    i = 0
    j = n - 1
    while len(final_route) < m:
        final_route.append(points[routes[i][j]])
        i, j = routes[i][j], j ^ (1 << (routes[i][j]-1))
    final_route.append(points[0])
    return dp[0][n-1] * d, final_route, num_routes[0][n-1] / 2


def tsp_dp_with_path(points, d, path):
    distances = get_distances_with_path(points, path)
    m = len(points)
    n = 2 ** (m-1)
    dp = [[float('inf')] * n for _ in range(m)]
    num_routes = [[0] * n for _ in range(m)]
    for i in range(m):
        dp[i][0] = distances[i][0]
        if distances[i][0] != float('inf'):
            num_routes[i][0] = 1
    routes = [[0] * n for _ in range(m)]
    for j in range(1, n):
        for i in range(m):
            # already arrived in j
            if i > 0 and (j >> (i-1)) & 1:
                continue
            for k in range(1, m):
                if (j >> (k-1)) & 1 == 0:
                    continue
                rest = j ^ (1 << (k-1))
                if distances[i][k] + dp[k][rest] < dp[i][j]:
                    dp[i][j] = distances[i][k] + dp[k][rest]
                    routes[i][j] = k
                if distances[i][k] != float("inf"):
                    num_routes[i][j] += num_routes[k][rest]
    final_route = list()
    final_route.append(points[0])
    i = 0
    j = n - 1
    while len(final_route) < m:
        final_route.append(points[routes[i][j]])
        i, j = routes[i][j], j ^ (1 << (routes[i][j]-1))
    final_route.append(points[0])
    return dp[0][n-1] * d, final_route, num_routes[0][n-1] / 2


def tsp_greedy(points, d):
    distances = get_distances(points)
    m = len(points)
    total = set(range(m))
    minimum = float('inf')
    res_route = None
    for start in range(m):
        final_route = [start]
        walked = 0
        rest = set(total)
        rest.remove(start)
        while len(final_route) < m:
            this = final_route[-1]
            nearest = float('inf')
            next_city = None
            for other in rest:
                if distances[this][other] < nearest:
                    next_city = other
                    nearest = distances[this][other]
            rest.remove(next_city)
            final_route.append(next_city)
            walked += nearest
        walked += distances[final_route[-1]][start]
        final_route.append(start)
        if walked < minimum:
            minimum = walked
            res_route = final_route
    return minimum * d, map(lambda x: points[x], res_route)
