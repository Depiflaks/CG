#ifndef CG_CORE_H
#define CG_CORE_H
#include <SFML/Graphics/RenderStates.hpp>
#include <SFML/Graphics/RenderTarget.hpp>
#include <SFML/Graphics/RenderWindow.hpp>
#include <SFML/System/Vector2.hpp>
#include <SFML/Window/Event.hpp>
#include <iostream>

namespace sfml_core
{

class Locatable
{
public:
	explicit Locatable(sf::Vector2f position)
		: m_position(position) {};

	virtual ~Locatable() = default;

	void SetPosition(sf::Vector2f position)
	{
		m_position = position;
	}

	sf::Vector2f Position() const
	{
		return m_position;
	}

	void Move(sf::Vector2f delta)
	{
		m_position += delta;
	}

private:
	sf::Vector2f m_position;
};

class Kinematic : public Locatable
{
public:
	explicit Kinematic(
		sf::Vector2f position, sf::Vector2f speed, sf::Vector2f acceleration)
		: Locatable(position)
		, m_speed(speed)
		, m_acceleration(acceleration)
	{
	}

	void SetSpeed(sf::Vector2f speed)
	{
		m_speed = speed;
	}

	[[nodiscard]] sf::Vector2f Speed() const
	{
		return m_speed;
	}

	void SetAcceleration(sf::Vector2f acc)
	{
		m_acceleration = acc;
	}

	void IntegrateSpeed(float dt)
	{
		m_speed += m_acceleration * dt;
	}

	void IntegratePosition(float dt)
	{
		Move(m_speed * dt);
	}

private:
	sf::Vector2f m_speed;
	sf::Vector2f m_acceleration;
};

class Drawable
{
public:
	virtual ~Drawable() = default;

	virtual void Draw(sf::RenderTarget& target, sf::RenderStates states) = 0;
};

class Draggable
{
public:
	virtual ~Draggable() = default;

	virtual void OnMouseDown(sf::Vector2f mousePosition)
	{
	}

	virtual void OnMouseUp(sf::Vector2f mousePosition)
	{
	}

	virtual void OnMouseMove(sf::Vector2f mousePosition)
	{
	}

	virtual void OnMouseLeave()
	{
	}

	virtual void OnMouseEnter()
	{
	}
};

class Widget : public Locatable
{
public:
	explicit Widget(const sf::Vector2f& position, const sf::Vector2f& size)
		: Locatable(position)
		, m_bounds(size)
	{
	}

	sf::Vector2f Bounds() const
	{
		return m_bounds;
	}

	void SetBounds(sf::Vector2f bounds)
	{
		m_bounds = bounds;
	}

	[[nodiscard]] bool Contains(sf::Vector2f point) const
	{
		return point.x >= Position().x && point.x <= Position().x + m_bounds.x
			&& point.y >= Position().y && point.y <= Position().y + m_bounds.y;
	}

private:
	sf::Vector2f m_bounds;
};

} // namespace sfml_core

#endif // CG_CORE_H
