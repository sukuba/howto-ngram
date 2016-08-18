#!python3

class Ngram(object):
    """
    N-gram index storage
    """
    def __init__(self, n=2):
        self.db = {}
        self.n = n
        
    def has_key(self, key):
        return key in self.db.keys()
        
    def append_key(self, key):
        if not self.has_key(key):
            self.db[key] = []
        
    def add_document(self, path, content):
        if len(content) < self.n:
            key = content
            self.append_key(key)
            self.db[key].append((path, 0))
        else:
            n = self.n
            N = len(content)
            for i in range(n, N+1):
                key = content[i-n:i]
                self.append_key(key)
                self.db[key].append((path, i-n))
        

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
