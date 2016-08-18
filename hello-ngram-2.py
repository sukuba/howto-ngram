#!python3

import re

class Ngram(object):
    """
    N-gram index storage
    """
    def __init__(self, n=2, ignore=r'[\s,.，．、。]+'):
        self.db = {}
        self.n = n
        self.ignore = re.compile(ignore)
        
    def has_key(self, key):
        return key in self.db.keys()
        
    def append_key(self, key):
        if not self.has_key(key):
            self.db[key] = []
        
    def add_index(self, key, path, start):
        lowkey = key.lower()
        self.append_key(lowkey)
        self.db[lowkey].append((path, start))
        
    def add_words(self, path, content, start):
        if len(content) == 0:
            pass
        elif len(content) < self.n:
            self.add_index(content, path, start)
        else:
            n = self.n
            N = len(content)
            for i in range(n, N+1):
                pos = i - n
                self.add_index(content[pos:i], path, start + pos)
        
    def add_document(self, path, content):
        #self.add_words(path, content[10:], 10)
        next_start = 0
        for words in self.ignore.finditer(content):
            print(words.start(), words.end(), words.group())
            start = next_start
            end = words.start()
            next_start = words.end()
            print(content[start:end], start, end)
            self.add_words(path, content[start:end], start)
        print(content[next_start:])
        self.add_words(path, content[next_start:], next_start)

def test():
    ix = Ngram()
    ix.add_document(u'/a', u"This is the first document we've added!")
    ix.add_document(u'/b', u'The second one is even more interesting!')
    print(ix.db)
    
    for path in (u'/a', u'/b'):
        bag = {}
        for key in ix.db.keys():
            vals = ix.db[key]
            for val in vals:
                if(val[0] == path):
                    bag[val[1]] = key
        print(path)
        for key in sorted(bag.keys()):
            print(bag[key], end=' ')
        print('')

if __name__ == '__main__':
    test()
