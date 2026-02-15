//
// Created by smmm on 2/15/26.
//

#ifndef CG_VIEW_STRATEGY_H
#define CG_VIEW_STRATEGY_H

namespace view_strategy
{

class ViewStrategy
{
public:
	virtual ~ViewStrategy() = default;
	virtual void Draw(sf::RenderTarget& target, sf::RenderStates states) = 0;
};

} // namespace view_strategy

#endif // CG_VIEW_STRATEGY_H
