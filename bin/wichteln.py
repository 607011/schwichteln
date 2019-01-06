#!/usr/bin/env python3

import random

class Player:
  TO_LEFT = -1
  TO_RIGHT = +1

  def __init__(self, idx, items):
    self.idx = idx
    self.owned = [items[idx]]  # list of owned items
    self.wanted = random.choice(items)
    self.cache = None  # kept item
    self.can_exchange = True  # user can exchange an item he owns for the item in his cache
    self.keep_probability = .001  # probability an unwanted item is kept when a 6 is rolled
    self.others = []  # fed with a list of all players

  def __hand_over(self, direction):
    for choice in self.owned:
      if choice != self.wanted:
        break
    self.others[(self.idx + direction) % len(self.others)].__take(choice)
    self.owned.remove(choice)

  def __take(self, item):
    self.owned.append(item)

  def roll_dice(self):
    if not self.owned:
      return
    pips = random.randint(1, 6)
    if pips == 6:  # player is allowed to keep one of the owned items
      if self.wanted in self.owned:
        if self.cache == None:
          self.cache = self.wanted
          self.owned.remove(self.wanted)
        elif self.can_exchange:
          choice = self.owned.index(self.wanted)
          self.cache, self.owned[choice] = self.owned[choice], self.cache
      elif self.keep_probability > random.random():
        if self.cache == None:
          self.cache = random.choice(self.owned)
          self.owned.remove(self.cache)
    elif pips % 2 == 0:
      self.__hand_over(self.TO_LEFT)
    else:
      self.__hand_over(self.TO_RIGHT)

  def __str__(self):
    return '#{} (wants {}, kept {}, owns {})'.format(
      self.idx,
      self.wanted,
      self.cache if self.cache else '-',
      ''.join(self.owned) if self.owned else '-')

def main():
  N = 70
  max_rounds = N*N*N
  items = [str(i) for i in range(N)]
  random.shuffle(items)
  players = [Player(idx, items) for idx in range(len(items))]
  for player in players:
    player.others = players
  rounds = 0
  while rounds < max_rounds and any(map(lambda p: len(p.owned) > 0, players)):
    for player in players:
      player.roll_dice()
    rounds +=1
  lucky = 0
  unlucky = 0
  for player in players:
    print(player, end='')
    if player.wanted == player.cache or player.wanted in player.owned:
      print(' **superlucky**' if player.owned and player.cache else ' **lucky**')
      lucky += 1
    elif not player.cache and not player.owned:
      print(' :-(')
      unlucky += 1
    else:
      print()
  print('After {} rounds:'.format(rounds))
  print('{:.1f}% lucky:'.format(100 * lucky / N))
  print('{:.1f}% unlucky:'.format(100 * unlucky / N))

if __name__ == '__main__':
  main()
