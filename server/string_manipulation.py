def comma_separated(s: str) -> str:
    """ "
    >>> comma_separated(',,,a b c,  def  , gh,,,א ב ג,,,,')
    'a b c,def,gh,א ב ג'
    """
    values = s.strip().split(",")
    values = map(str.strip, values)
    values = filter(bool, values)
    values = list(values)
    return ",".join(values)
