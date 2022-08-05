# encoding: utf-8

import sys
import re

match_log = re.compile('.*\[LOG\] (.*)')


def reformat(name):
    f_write = open('plates_team4.log', 'w')
    with open(name, 'r', encoding="UTF-8") as f_read:
        for line in f_read:
            a = match_log.match(line)
            if a is not None:
                f_write.write(a.group(1) + '\n')
    f_write.close()


if __name__ == '__main__':
    if len(sys.argv) == 2:
        filename = sys.argv[1]
        reformat(filename)
    print(filename)

