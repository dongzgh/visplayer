#!C:/Python27

import os
import shutil

# define path
dstDir = 'C:\\Temp\\PARTS'
srcDir = 'P:\\'

# start iteration
for srcRoot, srcSubDirs, srcFiles in os.walk(srcDir):
  srcFolder = os.path.basename(srcRoot)
  for srcFile in srcFiles:
    srcExt = os.path.splitext(srcFile)[1]
    if srcExt != '.igs':
      continue
    else:
      srcTail = os.path.splitdrive(srcRoot)[1]
      dstRoot = dstDir + srcTail
      if not os.path.exists(dstRoot):
        os.makedirs(dstRoot)
      src = os.path.join(srcRoot, srcFile)
      print 'Copying from SRC to DST ...'
      print 'SRC = ', src
      print 'DST = ', dstRoot
      print '\n'
      shutil.copy(src, dstRoot)
