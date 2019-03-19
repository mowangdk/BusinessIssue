#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time : 2018/1/10 下午7:20
# @Author : Sui Chen
import collections
import math
import itertools
import time
import heapq

import logging


def distance(point, other):
    if point[0] == other[0] and point[1] == other[1]:
        return float('inf')
    ret = math.sqrt((point[0] - other[0]) ** 2 + (point[1] - other[1]) ** 2)
    return ret


def parse_lines(lines, points):
    new_lines = set()
    for single_restriction in lines:
        try:
            i = tuple(single_restriction[0])
            j = tuple(single_restriction[1])
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
            if i != j and (tuple(points[i]), tuple(points[j])) not in restriction:
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
            if i != j and (tuple(points[i]), tuple(points[j])) in path:
                distances[i][j] = distance(points[i], points[j])
            else:
                distances[i][j] = float('inf')
    return distances


def calculate(permu, distances):
    ret = 0
    for i in range(len(permu)):
        ret += distances[permu[i]][permu[i-1]]
    return ret


def check(permu):
    count = collections.Counter()
    for i in range(len(permu)):
        f = permu[i]
        t = permu[i-1]
        if f > t:
            f, t = t, f
        count[f, t] += 1
    return max(count.values()) < 2


def brute_force(points, distances, d):
    n = len(points)
    g = itertools.permutations(range(n))
    count = 0
    best = float('inf')
    route = None
    for permu in g:
        dis = calculate(permu, distances)
        poss = check(permu)
        if poss and dis != float('inf'):
            count += 1
            if dis < best:
                best = dis
                route = permu
    if route is None:
        raise ValueError()
    route = [points[i] for i in route]
    route.append(route[0])
    return best*d, route, count


def build_vec(p1, p2):
    if p1 > p2:
        p1, p2 = p2, p1
    return tuple(p1+p2)


def Astar(points, distances, d):
    n = len(points)
    q = list()
    g = [[] for _ in range(n)]
    for i in range(n):
        for j in range(i):
            if distances[i][j] != float('inf'):
                g[i].append(j)
                g[j].append(i)
    q.append((0, [0], ()))
    count = 0
    best = float('inf')
    route = None
    while q:
        dis, path, vecs = q.pop()
        if len(path) == len(points):
            head = path[0]
            tail = path[-1]
            vec = build_vec(points[head], points[tail])
            if vec not in vecs:
                count += 1
                if dis + distances[head][tail] < best:
                    route = [points[i] for i in path]
                    route.append(route[0])
                    best = dis + distances[head][tail]
        else:
            for other in g[path[-1]]:
                vec = build_vec(points[other], points[path[-1]])
                if other not in path and vec not in vecs:
                    q.append((dis + distances[path[-1]][other], path + [other], vecs + (vec,)))
    if route is None:
        raise ValueError()
    return best*d, route, count / 2


def tsp_dp(points, d, restriction):
    t = time.time()
    distances = get_distances(points, restriction)
    print 'dis calculate %s' % (time.time() - t)
    t = time.time()
    ret = Astar(points, distances, d)
    print 'astar %s' % (time.time() - t)
    t = time.time()
    #retb = brute_force(points, distances, d)
    retb = None
    print 'brute force %s' % (time.time() - t)
    return ret, retb


def tsp_dp_with_path(points, d, path):
    distances = get_distances_with_path(points, path)
    return brute_force(points, distances, d)


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


if __name__ == '__main__':
    print tsp_dp([[0,0],[0,1],[1,0],[1,1],[2,0],[2,1],[3,0],[3,1],[4,0],[4,1],[0,0]], 1, [])
