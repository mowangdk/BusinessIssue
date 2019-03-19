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


def perm(a, k=0):
    if k == len(a):
        yield a
    else:
        for i in xrange(k, len(a)):
            if a[i] != a[k]:
                a[k], a[i] = a[i], a[k]
                g = perm(a, k+1)
                for x in g:
                    yield x
                a[k], a[i] = a[i], a[k]


def brute_force(points, distances, dd):
    points = map(tuple, points)
    d = dict()
    for point in points:
        if point not in d:
            d[point] = chr(97+len(d))
    rd = dict([(v,k) for k, v in d.items()])
    indexd = dict()
    for i, point in enumerate(points):
        indexd[point] = i
    g = collections.defaultdict(dict)
    for p1 in d:
        i1 = indexd[p1]
        for p2 in d:
            i2 = indexd[p2]
            g[d[p1]][d[p2]] = distances[i1][i2]
    p = [d[point] for point in points[1:]]
    permutations = itertools.permutations(p)
    count = 0
    best = float('inf')
    route = None
    start = d[points[0]]
    for permu in permutations:
        s = start + ''.join(permu) + start
        c = set()
        reused = False
        for i in range(len(s)-1):
            v = s[i:i+2]
            if v in c:
                reused = True
                break
            else:
                c.add(v)
                c.add(v[::-1])
        if not reused:
            dis = 0
            for i in range(len(s)-1):
                dis += g[s[i]][s[i+1]]
            if dis != float('inf'):
                count += 1
                if dis < best:
                    best = dis
                    route = s
    if route is not None:
        route = [rd[char] for char in route]
    return best*dd, route, count / 2


def dfs(points, distances, d):
    points = map(tuple, points)
    d = dict()
    for point in points:
        d[point] = chr(97+len(d))
    rd = dict([(v,k) for k, v in d.items()])
    indexd = dict()
    for i, point in enumerate(points):
        indexd[point] = i
    g = collections.defaultdict(dict)
    for p1 in d:
        i1 = indexd[p1]
        for p2 in d:
            if p1 != p2:
                i2 = indexd[p2]
                if distances[i1][i2] != float('inf'):
                    g[d[p1]][d[p2]] = distances[i1][i2]
    memo = dict()
    mmax = [0] * len(d)
    for point in points:
        mmax[ord(d[point])-97] += 1

    def helper(s):
        count = [0] * len(d)
        for char in s:
            count[ord(char)-97] += 1
        if count > mmax:
            return float('inf'), 0
        if len(s) == len(points):
            return g[s[-1]][s[0]], 1
        if s not in memo:
            l, c = float('inf'), 0
            for other in g[s[-1]]:
                v1 = s[-1] + other
                v2 = other + s[-1]
                if v1 not in s and v2 not in s:
                    ol, oc = helper(s+other)
                    c += oc
                    l = min(l, ol + g[s[-1]][other])
            memo[s] = (l, c)
        return memo[s]
    return helper('a')


def build_vec(p1, p2):
    if p1 > p2:
        p1, p2 = p2, p1
    return p1+p2


def Astar(points, distances, dd):
    points = map(tuple, points)
    d = dict()
    for point in points:
        if point not in d:
            d[point] = chr(97+len(d))
    rd = dict([(v,k) for k, v in d.items()])
    indexd = dict()
    for i, point in enumerate(points):
        indexd[point] = i
    g = collections.defaultdict(dict)
    for p1 in d:
        i1 = indexd[p1]
        for p2 in d:
            i2 = indexd[p2]
            if distances[i1][i2] != float('inf'):
                g[d[p1]][d[p2]] = distances[i1][i2]
    q = list()
    q.append((0, 'a'))
    count = 0
    best = float('inf')
    route = None
    num = collections.Counter()
    for point in points:
        num[d[point]] += 1
    while q:
        dis, path = q.pop()
        if len(path) == len(points):
            head = path[0]
            tail = path[-1]
            v1 = head + tail
            v2 = tail + head
            if v1 not in path and v2 not in path and tail in g[head]:
                count += 1
                if dis + g[head][tail] < best:
                    route = path
                    best = dis + g[head][tail]
        else:
            for other in g[path[-1]]:
                v1 = path[-1] + other
                v2 = other + path[-1]
                if v1 not in path and v2 not in path and path.count(other) < num[other]:
                    q.append((dis + g[path[-1]][other], path + other))
    if route is not None:
        route = [rd[i] for i in route]
        route.append(route[0])
    else:
        raise ValueError()
    return best*dd, route, count / 2


def tsp_dp(points, d, restriction):
    distances = get_distances(points, restriction)
    ret = Astar(points, distances, d)
    return ret


def tsp_dp_with_path(points, d, path):
    distances = get_distances_with_path(points, path)
    ret = Astar(points, distances, d)
    return ret


if __name__ == '__main__':
    a =[[0,0],[0,1],[1,0],[1,1],[2,0],[2,1],[3,0],[3,1],[4,0],[1,1],[0,0]]
    b = [[0,0],[0,1],[1,0]]
    print tsp_dp([[0,0],[0,1],[1,0],[1,1]], 1, [])
