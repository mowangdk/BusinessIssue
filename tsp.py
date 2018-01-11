#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time : 2018/1/10 下午7:20
# @Author : Sui Chen
import math


def distance(point, other):
    return math.sqrt((point[0] - other[0]) ** 2 + (point[1] - other[1]) ** 2)


def get_distances(points):
    n = len(points)
    distances = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                distances[i][j] = distance(points[i], points[j])
            else:
                distances[i][j] = float('inf')
    return distances


def tsp_dp(points, d):
    distances = get_distances(points)
    m = len(points)
    n = 2 ** (m-1)
    dp = [[float('inf')] * n for _ in range(m)]
    for i in range(m):
        dp[i][0] = distances[i][0]
    routes = [[0] * n for _ in range(m)]
    for j in range(1, n):
        for i in range(m):
            # already arrived in j
            if i > 0 and (j >> (i-1)) & 1:
                continue
            for k in range(1, m):
                if (j >> (k-1)) & 1 == 0:
                    continue
                if distances[i][k] + dp[k][j ^ (1 << (k-1))] < dp[i][j]:
                    dp[i][j] = distances[i][k] + dp[k][j ^ (1 << (k-1))]
                    routes[i][j] = k
    final_route = list()
    final_route.append(points[0])
    i = 0
    j = n - 1
    while len(final_route) < m:
        final_route.append(points[routes[i][j]])
        i, j = routes[i][j], j ^ (1 << (routes[i][j]-1))
    final_route.append(points[0])
    return dp[0][n-1] * d, final_route


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

points = ((0,0),(0,1),(1,0),(1,1), (2,1), (2,0))
print tsp_greedy(points, 1)




